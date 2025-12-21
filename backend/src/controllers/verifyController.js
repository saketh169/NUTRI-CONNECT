const mongoose = require('mongoose');
const { Dietitian, Organization, CorporatePartner } = require('../models/userModel');

// Handle dietitian file uploads and mark as Pending
async function uploadDietitianFiles(req, res) {
    try {
        const dietitian = req.session.dietitian;
        if (!dietitian) {
            return res.status(403).json({ success: false, message: 'Unauthorized: Dietitian session not found' });
        }

        let fileDetails = 'Uploaded Files:\n';
        const filesUpdate = {};
        const verificationStatusUpdate = {};

        const fieldMap = {
            resume: 'resume',
            degreeCertificate: 'degreeCertificate',
            licenseDocument: 'licenseDocument',
            idProof: 'idProof',
            experienceCertificates: 'experienceCertificates',
            specializationCertifications: 'specializationCertifications',
            internshipCertificate: 'internshipCertificate',
            researchPapers: 'researchPapers'
        };

        for (const field in req.files) {
            req.files[field].forEach(file => {
                fileDetails += `Field: ${field}\n`;
                fileDetails += `Original Name: ${file.originalname}\n`;
                fileDetails += `MIME Type: ${file.mimetype}\n`;
                fileDetails += `Size: ${file.size} bytes\n`;
                fileDetails += '---------------------------\n';

                const schemaField = fieldMap[field];
                if (schemaField) {
                    filesUpdate[`files.${schemaField}`] = file.buffer;
                    verificationStatusUpdate[`verificationStatus.${schemaField}`] = 'Pending';
                }
            });
        }

        console.log(fileDetails);

        const unsetFields = {};
        const existingDietitian = await Dietitian.findById(dietitian.id);
        if (existingDietitian.files && existingDietitian.files.finalReport) {
            unsetFields['files.finalReport'] = '';
            console.log(`Removing existing final report for dietitian: ${dietitian.name}`);
        }

        const updatedDietitian = await Dietitian.findByIdAndUpdate(
            dietitian.id,
            {
                $set: {
                    ...filesUpdate,
                    ...verificationStatusUpdate,
                    'verificationStatus.finalReport': 'Not Received'
                },
                $unset: unsetFields
            },
            { new: true }
        );

        if (!updatedDietitian) {
            return res.status(404).json({ success: false, message: 'Dietitian not found' });
        }

        req.session.dietitian = {
            id: updatedDietitian._id,
            role: 'dietitian',
            email: updatedDietitian.email,
            name: updatedDietitian.name
        };

        res.status(200).json({
            success: true,
            message: 'Files uploaded and marked as Pending successfully!',
            files: req.files,
            dietitian: {
                id: updatedDietitian._id,
                email: updatedDietitian.email,
                name: updatedDietitian.name,
                verificationStatus: updatedDietitian.verificationStatus
            }
        });
    } catch (err) {
        console.error('Error uploading files:', err.message);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
}

// Fetch all dietitians and log file statuses
async function getDietitians(req, res) {
    try {
        const dietitians = await Dietitian.find({}).select('name email files verificationStatus documentUploadStatus');

        console.log('All Dietitians:');
        dietitians.forEach((dietitian) => {
            console.log(`- ${dietitian.name}: ${dietitian.documentUploadStatus || 'No status'}`);
        });

        res.status(200).json(dietitians);
    } catch (error) {
        console.error('Error fetching dietitians:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch dietitians' });
    }
}

// Fetch a dietitian file as base64
async function getDietitianFile(req, res) {
    try {
        const { dietitianId, field } = req.params;
        const validFields = [
            'resume', 'degreeCertificate', 'licenseDocument', 'idProof',
            'experienceCertificates', 'specializationCertifications',
            'internshipCertificate', 'researchPapers', 'finalReport'
        ];
        if (!validFields.includes(field)) {
            return res.status(400).json({ success: false, message: 'Invalid file field' });
        }

        const dietitian = await Dietitian.findById(dietitianId);
        if (!dietitian) {
            return res.status(404).json({ success: false, message: 'Dietitian not found' });
        }

        const files = dietitian.files || {};
        const fileBuffer = files[field];
        if (!fileBuffer || fileBuffer.length === 0) {
            return res.status(404).json({ success: false, message: 'File not found' });
        }

        const base64Data = fileBuffer.toString('base64');
        const fieldMap = {
            resume: { name: 'Resume', ext: 'pdf', mime: 'application/pdf' },
            degreeCertificate: { name: 'Degree Certificate', ext: 'pdf', mime: 'application/pdf' },
            licenseDocument: { name: 'License Document', ext: 'pdf', mime: 'application/pdf' },
            idProof: { name: 'ID Proof', ext: 'pdf', mime: 'application/pdf' },
            experienceCertificates: { name: 'Experience Certificates', ext: 'pdf', mime: 'application/pdf' },
            specializationCertifications: { name: 'Specialization Certifications', ext: 'pdf', mime: 'application/pdf' },
            internshipCertificate: { name: 'Internship Certificate', ext: 'pdf', mime: 'application/pdf' },
            researchPapers: { name: 'Research Papers', ext: 'pdf', mime: 'application/pdf' },
            finalReport: { name: 'Final Report', ext: 'pdf', mime: 'application/pdf' }
        };

        res.status(200).json({
            success: true,
            file: {
                name: fieldMap[field].name,
                ext: fieldMap[field].ext,
                mime: fieldMap[field].mime,
                base64: base64Data
            }
        });
    } catch (error) {
        console.error('Error fetching file:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch file' });
    }
}

// Approve a dietitian document
async function approveDietitianDocument(req, res) {
    try {
        const { dietitianId } = req.params;
        const { field } = req.body;
        const validFields = [
            'resume', 'degreeCertificate', 'licenseDocument', 'idProof',
            'experienceCertificates', 'specializationCertifications',
            'internshipCertificate', 'researchPapers'
        ];
        if (!validFields.includes(field)) {
            return res.status(400).json({ success: false, message: 'Invalid file field' });
        }

        const dietitian = await Dietitian.findById(dietitianId);
        if (!dietitian) {
            return res.status(404).json({ success: false, message: 'Dietitian not found' });
        }

        if (!dietitian.verificationStatus || dietitian.verificationStatus[field] !== 'Pending') {
            return res.status(400).json({ success: false, message: 'Document is not in Pending status' });
        }

        dietitian.verificationStatus[field] = 'Verified';
        await dietitian.save();

        res.status(200).json(dietitian);
    } catch (error) {
        console.error('Error approving document:', error);
        res.status(500).json({ success: false, message: 'Failed to approve document' });
    }
}

// Disapprove a dietitian document
async function disapproveDietitianDocument(req, res) {
    try {
        const { dietitianId } = req.params;
        const { field } = req.body;
        const validFields = [
            'resume', 'degreeCertificate', 'licenseDocument', 'idProof',
            'experienceCertificates', 'specializationCertifications',
            'internshipCertificate', 'researchPapers'
        ];
        if (!validFields.includes(field)) {
            return res.status(400).json({ success: false, message: 'Invalid file field' });
        }

        const dietitian = await Dietitian.findById(dietitianId);
        if (!dietitian) {
            return res.status(404).json({ success: false, message: 'Dietitian not found' });
        }

        if (!dietitian.verificationStatus || dietitian.verificationStatus[field] !== 'Pending') {
            return res.status(400).json({ success: false, message: 'Document is not in Pending status' });
        }

        dietitian.verificationStatus[field] = 'Rejected';
        await dietitian.save();

        res.status(200).json(dietitian);
    } catch (error) {
        console.error('Error disapproving document:', error);
        res.status(500).json({ success: false, message: 'Failed to disapprove document' });
    }
}

// Final approval for dietitian
async function finalApproveDietitian(req, res) {
    try {
        const { dietitianId } = req.params;
        const dietitian = await Dietitian.findById(dietitianId);
        if (!dietitian) {
            return res.status(404).json({ success: false, message: 'Dietitian not found' });
        }

        if (!dietitian.verificationStatus || !dietitian.verificationStatus.finalReport) {
            return res.status(400).json({ success: false, message: 'Final report not uploaded' });
        }

        dietitian.verificationStatus.finalReport = 'Verified';
        dietitian.documentUploadStatus = 'verified'; // Update overall status
        await dietitian.save();

        console.log(`Final Approval Submitted: ${dietitian.name} - Final Report: Verified`);

        res.status(200).json(dietitian);
    } catch (error) {
        console.error('Error submitting final approval:', error);
        res.status(500).json({ success: false, message: 'Failed to submit final approval' });
    }
}

// Final disapproval for dietitian
async function finalDisapproveDietitian(req, res) {
    try {
        const { dietitianId } = req.params;
        const dietitian = await Dietitian.findById(dietitianId);
        if (!dietitian) {
            return res.status(404).json({ success: false, message: 'Dietitian not found' });
        }

        if (!dietitian.verificationStatus || !dietitian.verificationStatus.finalReport) {
            return res.status(400).json({ success: false, message: 'Final report not uploaded' });
        }

        dietitian.verificationStatus.finalReport = 'Rejected';
        dietitian.documentUploadStatus = 'rejected'; // Update overall status
        await dietitian.save();

        console.log(`Final Disapproval Submitted: ${dietitian.name} - Final Report: Rejected`);

        res.status(200).json(dietitian);
    } catch (error) {
        console.error('Error submitting final disapproval:', error);
        res.status(500).json({ success: false, message: 'Failed to submit final disapproval' });
    }
}

// Upload final verification report for dietitian
async function uploadDietitianFinalReport(req, res) {
    try {
        const { dietitianId } = req.params;
        const dietitian = await Dietitian.findById(dietitianId);
        if (!dietitian) {
            return res.status(404).json({ success: false, message: 'Dietitian not found' });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        dietitian.files = dietitian.files || {};
        dietitian.files.finalReport = req.file.buffer;
        dietitian.verificationStatus = dietitian.verificationStatus || {};
        dietitian.verificationStatus.finalReport = 'Received';
        await dietitian.save();

        res.status(200).json(dietitian);
    } catch (error) {
        console.error('Error uploading report:', error);
        res.status(500).json({ success: false, message: 'Failed to upload verification report' });
    }
}

// Fetch current dietitian's details
async function getCurrentDietitian(req, res) {
    try {
        const dietitianId = req.session.dietitian.id;
        if (!mongoose.Types.ObjectId.isValid(dietitianId)) {
            return res.status(400).json({ success: false, message: 'Invalid dietitian ID in session' });
        }

        const dietitian = await Dietitian.findById(dietitianId).select('name email verificationStatus files');
        if (!dietitian) {
            return res.status(404).json({ success: false, message: 'Dietitian not found' });
        }

        let finalReportBase64 = null;
        if (dietitian.files && dietitian.files.finalReport) {
            finalReportBase64 = dietitian.files.finalReport.toString('base64');
        }

        console.log(`Dietitian: ${dietitian.name}`);
        const fieldMap = {
            resume: 'Resume',
            degreeCertificate: 'Degree Certificate',
            licenseDocument: 'License Document',
            idProof: 'ID Proof',
            experienceCertificates: 'Experience Certificates',
            specializationCertifications: 'Specialization Certifications',
            internshipCertificate: 'Internship Certificate',
            researchPapers: 'Research Papers',
            finalReport: 'Final Report'
        };

        const documentFields = [
            'resume', 'degreeCertificate', 'licenseDocument', 'idProof',
            'experienceCertificates', 'specializationCertifications',
            'internshipCertificate', 'researchPapers', 'finalReport'
        ];

        documentFields.forEach(field => {
            const status = dietitian.verificationStatus[field] || (field === 'finalReport' ? 'Not Received' : 'Not Uploaded');
            console.log(`${fieldMap[field]}: ${status}`);
        });

        res.status(200).json({
            success: true,
            dietitian: {
                id: dietitian._id,
                name: dietitian.name,
                email: dietitian.email,
                verificationStatus: dietitian.verificationStatus,
                finalReport: finalReportBase64 ? {
                    name: 'Final Verification Report',
                    ext: 'pdf',
                    mime: 'application/pdf',
                    base64: finalReportBase64
                } : null
            }
        });
    } catch (error) {
        console.error('Error fetching current dietitian:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch dietitian details' });
    }
}

// Check dietitian final report status
async function checkDietitianStatus(req, res) {
    try {
        const dietitian = await Dietitian.findById(req.session.dietitian.id).select('verificationStatus');
        if (!dietitian) {
            return res.status(404).json({ success: false, message: 'Dietitian not found' });
        }

        const finalReportStatus = dietitian.verificationStatus.finalReport;

        res.status(200).json({
            success: true,
            finalReportStatus: finalReportStatus
        });
    } catch (err) {
        console.error('Error checking final report status:', err.message);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
}

// Handle organization file uploads and mark as Pending
async function uploadOrganizationFiles(req, res) {
    try {
        const organization = req.session.organization;
        if (!organization) {
            return res.status(403).json({ success: false, message: 'Unauthorized: Organization session not found' });
        }

        let fileDetails = 'Uploaded Files:\n';
        const filesUpdate = {};
        const verificationStatusUpdate = {};

        const fieldMap = {
            orgLogo: 'orgLogo',
            orgBrochure: 'orgBrochure',
            legalDocument: 'legalDocument',
            taxDocument: 'taxDocument',
            addressProof: 'addressProof',
            businessLicense: 'businessLicense',
            authorizedRepId: 'authorizedRepId',
            bankDocument: 'bankDocument'
        };

        for (const field in req.files) {
            req.files[field].forEach(file => {
                fileDetails += `Field: ${field}\n`;
                fileDetails += `Original Name: ${file.originalname}\n`;
                fileDetails += `MIME Type: ${file.mimetype}\n`;
                fileDetails += `Size: ${file.size} bytes\n`;
                fileDetails += '---------------------------\n';

                const schemaField = fieldMap[field];
                if (schemaField) {
                    filesUpdate[`files.${schemaField}`] = file.buffer;
                    verificationStatusUpdate[`verificationStatus.${schemaField}`] = 'Pending';
                }
            });
        }

        console.log(fileDetails);

        const unsetFields = {};
        const existingOrganization = await Organization.findById(organization.id);
        if (existingOrganization.files && existingOrganization.files.finalReport) {
            unsetFields['files.finalReport'] = '';
            console.log(`Removing existing final report for organization: ${organization.name}`);
        }

        const updatedOrganization = await Organization.findByIdAndUpdate(
            organization.id,
            {
                $set: {
                    ...filesUpdate,
                    ...verificationStatusUpdate,
                    'verificationStatus.finalReport': 'Not Received'
                },
                $unset: unsetFields
            },
            { new: true }
        );

        if (!updatedOrganization) {
            return res.status(404).json({ success: false, message: 'Organization not found' });
        }

        req.session.organization = {
            id: updatedOrganization._id,
            role: 'organization',
            email: updatedOrganization.email,
            name: updatedOrganization.name
        };

        res.status(200).json({
            success: true,
            message: 'Files uploaded and marked as Pending successfully!',
            files: req.files,
            organization: {
                id: updatedOrganization._id,
                email: updatedOrganization.email,
                name: updatedOrganization.name,
                verificationStatus: updatedOrganization.verificationStatus
            }
        });
    } catch (err) {
        console.error('Error uploading files:', err.message);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
}

// Fetch all organizations and log file statuses
async function getOrganizations(req, res) {
    try {
        const organizations = await Organization.find({}).select('name email files verificationStatus documentUploadStatus');

        console.log('All Organizations:');
        organizations.forEach((organization) => {
            console.log(`- ${organization.name}: ${organization.documentUploadStatus || 'No status'}`);
        });

        res.status(200).json(organizations);
    } catch (error) {
        console.error('Error fetching organizations:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch organizations' });
    }
}

// Fetch an organization file as base64
async function getOrganizationFile(req, res) {
    try {
        const { orgId, field } = req.params;
        const validFields = [
            'orgLogo', 'orgBrochure', 'legalDocument', 'taxDocument',
            'addressProof', 'businessLicense', 'authorizedRepId', 'bankDocument', 'finalReport'
        ];
        if (!validFields.includes(field)) {
            return res.status(400).json({ success: false, message: 'Invalid file field' });
        }

        const organization = await Organization.findById(orgId);
        if (!organization) {
            return res.status(404).json({ success: false, message: 'Organization not found' });
        }

        let fileBuffer;
        if (organization.files && organization.files[field]) {
            fileBuffer = organization.files[field];
        } else if (organization.documents && organization.documents[field] && organization.documents[field].data) {
            fileBuffer = organization.documents[field].data;
        }

        if (!fileBuffer || fileBuffer.length === 0) {
            return res.status(404).json({ success: false, message: 'File not found' });
        }

        const base64Data = fileBuffer.toString('base64');
        const fieldMap = {
            orgLogo: { name: 'Organization Logo', ext: 'png', mime: 'image/png' },
            orgBrochure: { name: 'Organization Brochure', ext: 'pdf', mime: 'application/pdf' },
            legalDocument: { name: 'Legal Document', ext: 'pdf', mime: 'application/pdf' },
            taxDocument: { name: 'Tax Document', ext: 'pdf', mime: 'application/pdf' },
            addressProof: { name: 'Proof of Address', ext: 'pdf', mime: 'application/pdf' },
            businessLicense: { name: 'Business License', ext: 'pdf', mime: 'application/pdf' },
            authorizedRepId: { name: 'Identity Proof', ext: 'pdf', mime: 'application/pdf' },
            bankDocument: { name: 'Bank Document', ext: 'pdf', mime: 'application/pdf' },
            finalReport: { name: 'Final Report', ext: 'pdf', mime: 'application/pdf' }
        };

        res.status(200).json({
            success: true,
            file: {
                name: fieldMap[field].name,
                ext: fieldMap[field].ext,
                mime: fieldMap[field].mime,
                base64: base64Data
            }
        });
    } catch (error) {
        console.error('Error fetching file:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch file' });
    }
}

// Approve an organization document
async function approveOrganizationDocument(req, res) {
    try {
        const { orgId } = req.params;
        const { field } = req.body;
        const validFields = [
            'orgLogo', 'orgBrochure', 'legalDocument', 'taxDocument',
            'addressProof', 'businessLicense', 'authorizedRepId', 'bankDocument'
        ];
        if (!validFields.includes(field)) {
            return res.status(400).json({ success: false, message: 'Invalid file field' });
        }

        const organization = await Organization.findById(orgId);
        if (!organization) {
            return res.status(404).json({ success: false, message: 'Organization not found' });
        }

        if (!organization.verificationStatus || organization.verificationStatus[field] !== 'Pending') {
            return res.status(400).json({ success: false, message: 'Document is not in Pending status' });
        }

        organization.verificationStatus[field] = 'Verified';
        await organization.save();

        res.status(200).json(organization);
    } catch (error) {
        console.error('Error approving document:', error);
        res.status(500).json({ success: false, message: 'Failed to approve document' });
    }
}

// Disapprove an organization document
async function disapproveOrganizationDocument(req, res) {
    try {
        const { orgId } = req.params;
        const { field } = req.body;
        const validFields = [
            'orgLogo', 'orgBrochure', 'legalDocument', 'taxDocument',
            'addressProof', 'businessLicense', 'authorizedRepId', 'bankDocument'
        ];
        if (!validFields.includes(field)) {
            return res.status(400).json({ success: false, message: 'Invalid file field' });
        }

        const organization = await Organization.findById(orgId);
        if (!organization) {
            return res.status(404).json({ success: false, message: 'Organization not found' });
        }

        if (!organization.verificationStatus || organization.verificationStatus[field] !== 'Pending') {
            return res.status(400).json({ success: false, message: 'Document is not in Pending status' });
        }

        organization.verificationStatus[field] = 'Rejected';
        await organization.save();

        res.status(200).json(organization);
    } catch (error) {
        console.error('Error disapproving document:', error);
        res.status(500).json({ success: false, message: 'Failed to disapprove document' });
    }
}

// Final approval for organization
async function finalApproveOrganization(req, res) {
    try {
        const { orgId } = req.params;
        const organization = await Organization.findById(orgId);
        if (!organization) {
            return res.status(404).json({ success: false, message: 'Organization not found' });
        }

        if (!organization.verificationStatus || !organization.verificationStatus.finalReport) {
            return res.status(400).json({ success: false, message: 'Final report not uploaded' });
        }

        organization.verificationStatus.finalReport = 'Verified';
        organization.documentUploadStatus = 'verified'; // Update overall status
        await organization.save();

        console.log(`Final Approval Submitted: ${organization.name} - Final Report: Verified`);

        res.status(200).json(organization);
    } catch (error) {
        console.error('Error submitting final approval:', error);
        res.status(500).json({ success: false, message: 'Failed to submit final approval' });
    }
}

// Final disapproval for organization
async function finalDisapproveOrganization(req, res) {
    try {
        const { orgId } = req.params;
        const organization = await Organization.findById(orgId);
        if (!organization) {
            return res.status(404).json({ success: false, message: 'Organization not found' });
        }

        if (!organization.verificationStatus || !organization.verificationStatus.finalReport) {
            return res.status(400).json({ success: false, message: 'Final report not uploaded' });
        }

        organization.verificationStatus.finalReport = 'Rejected';
        organization.documentUploadStatus = 'rejected'; // Update overall status
        await organization.save();

        console.log(`Final Disapproval Submitted: ${organization.name} - Final Report: Rejected`);

        res.status(200).json(organization);
    } catch (error) {
        console.error('Error submitting final disapproval:', error);
        res.status(500).json({ success: false, message: 'Failed to submit final disapproval' });
    }
}

// Upload final verification report for organization
async function uploadOrganizationFinalReport(req, res) {
    try {
        const { orgId } = req.params;
        const organization = await Organization.findById(orgId);
        if (!organization) {
            return res.status(404).json({ success: false, message: 'Organization not found' });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        organization.files = organization.files || {};
        organization.files.finalReport = req.file.buffer;
        organization.verificationStatus = organization.verificationStatus || {};
        organization.verificationStatus.finalReport = 'Received';
        await organization.save();

        res.status(200).json(organization);
    } catch (error) {
        console.error('Error uploading report:', error);
        res.status(500).json({ success: false, message: 'Failed to upload verification report' });
    }
}

// Fetch current organization's details
async function getCurrentOrganization(req, res) {
    try {
        const organizationId = req.session.organization.id;
        if (!mongoose.Types.ObjectId.isValid(organizationId)) {
            return res.status(400).json({ success: false, message: 'Invalid organization ID in session' });
        }

        const organization = await Organization.findById(organizationId).select('name email verificationStatus files');
        if (!organization) {
            return res.status(404).json({ success: false, message: 'Organization not found' });
        }

        let finalReportBase64 = null;
        if (organization.files && organization.files.finalReport) {
            finalReportBase64 = organization.files.finalReport.toString('base64');
        }

        console.log(`Organization: ${organization.name}`);
        const fieldMap = {
            orgLogo: 'Organization Logo',
            orgBrochure: 'Organization Brochure',
            legalDocument: 'Legal Document',
            taxDocument: 'Tax Document',
            addressProof: 'Proof of Address',
            businessLicense: 'Business License',
            authorizedRepId: 'Identity Proof',
            bankDocument: 'Bank Document',
            finalReport: 'Final Report'
        };

        const documentFields = [
            'orgLogo', 'orgBrochure', 'legalDocument', 'taxDocument',
            'addressProof', 'businessLicense', 'authorizedRepId', 'bankDocument', 'finalReport'
        ];

        documentFields.forEach(field => {
            const status = organization.verificationStatus[field] || (field === 'finalReport' ? 'Not Received' : 'Not Uploaded');
            console.log(`${fieldMap[field]}: ${status}`);
        });

        res.status(200).json({
            success: true,
            organization: {
                id: organization._id,
                name: organization.name,
                email: organization.email,
                verificationStatus: organization.verificationStatus,
                finalReport: finalReportBase64 ? {
                    name: 'Final Verification Report',
                    ext: 'pdf',
                    mime: 'application/pdf',
                    base64: finalReportBase64
                } : null
            }
        });
    } catch (error) {
        console.error('Error fetching current organization:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch organization details' });
    }
}

// Check organization final report status
async function checkOrganizationStatus(req, res) {
    try {
        const organization = await Organization.findById(req.session.organization.id).select('verificationStatus');
        if (!organization) {
            return res.status(404).json({ success: false, message: 'Organization not found' });
        }

        const finalReportStatus = organization.verificationStatus.finalReport;

        res.status(200).json({
            success: true,
            finalReportStatus: finalReportStatus
        });
    } catch (err) {
        console.error('Error checking final report status:', err.message);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
}

// Handle corporate partner file uploads and mark as Pending
async function uploadCorporateFiles(req, res) {
    try {
        const corporatePartner = req.session.corporatePartner;
        if (!corporatePartner) {
            return res.status(403).json({ success: false, message: 'Unauthorized: Corporate Partner session not found' });
        }

        let fileDetails = 'Uploaded Files:\n';
        const filesUpdate = {};
        const verificationStatusUpdate = {};

        const fieldMap = {
            businessLicense: 'businessLicense',
            taxIdDocument: 'taxIdDocument',
            incorporationCertificate: 'incorporationCertificate',
            authorizedRepId: 'authorizedRepId',
            bankAccountProof: 'bankAccountProof',
            financialAudit: 'financialAudit',
            codeOfConduct: 'codeOfConduct'
        };

        for (const field in req.files) {
            req.files[field].forEach(file => {
                fileDetails += `Field: ${field}\n`;
                fileDetails += `Original Name: ${file.originalname}\n`;
                fileDetails += `MIME Type: ${file.mimetype}\n`;
                fileDetails += `Size: ${file.size} bytes\n`;
                fileDetails += '---------------------------\n';

                const schemaField = fieldMap[field];
                if (schemaField) {
                    filesUpdate[`files.${schemaField}`] = file.buffer;
                    verificationStatusUpdate[`verificationStatus.${schemaField}`] = 'Pending';
                }
            });
        }

        console.log(fileDetails);

        const unsetFields = {};
        const existingCorporate = await CorporatePartner.findById(corporatePartner.id);
        if (existingCorporate.files && existingCorporate.files.finalReport) {
            unsetFields['files.finalReport'] = '';
            console.log(`Removing existing final report for corporate partner: ${corporatePartner.name}`);
        }

        const updatedCorporate = await CorporatePartner.findByIdAndUpdate(
            corporatePartner.id,
            {
                $set: {
                    ...filesUpdate,
                    ...verificationStatusUpdate,
                    'verificationStatus.finalReport': 'Not Received'
                },
                $unset: unsetFields
            },
            { new: true }
        );

        if (!updatedCorporate) {
            return res.status(404).json({ success: false, message: 'Corporate Partner not found' });
        }

        req.session.corporatePartner = {
            id: updatedCorporate._id,
            role: 'corporatePartner',
            email: updatedCorporate.email,
            name: updatedCorporate.name
        };

        res.status(200).json({
            success: true,
            message: 'Files uploaded and marked as Pending successfully!',
            files: req.files,
            corporatePartner: {
                id: updatedCorporate._id,
                email: updatedCorporate.email,
                name: updatedCorporate.name,
                verificationStatus: updatedCorporate.verificationStatus
            }
        });
    } catch (err) {
        console.error('Error uploading files:', err.message);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
}

// Fetch all corporate partners and log file statuses
async function getCorporatePartners(req, res) {
    try {
        const corporatePartners = await CorporatePartner.find({}).select('name email files verificationStatus documentUploadStatus');

        console.log('All Corporate Partners:');
        corporatePartners.forEach((partner) => {
            console.log(`- ${partner.name}: ${partner.documentUploadStatus || 'No status'}`);
        });

        res.status(200).json(corporatePartners);
    } catch (error) {
        console.error('Error fetching corporate partners:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch corporate partners' });
    }
}

// Fetch a corporate partner file as base64
async function getCorporateFile(req, res) {
    try {
        const { cpId, field } = req.params;
        const validFields = [
            'businessLicense', 'taxIdDocument', 'incorporationCertificate',
            'authorizedRepId', 'bankAccountProof', 'financialAudit', 'codeOfConduct', 'finalReport'
        ];
        if (!validFields.includes(field)) {
            return res.status(400).json({ success: false, message: 'Invalid file field' });
        }

        const corporatePartner = await CorporatePartner.findById(cpId);
        if (!corporatePartner) {
            return res.status(404).json({ success: false, message: 'Corporate Partner not found' });
        }

        let fileBuffer;
        if (corporatePartner.files && corporatePartner.files[field]) {
            fileBuffer = corporatePartner.files[field];
        } else if (corporatePartner.documents && corporatePartner.documents[field] && corporatePartner.documents[field].data) {
            fileBuffer = corporatePartner.documents[field].data;
        }

        if (!fileBuffer || fileBuffer.length === 0) {
            return res.status(404).json({ success: false, message: 'File not found' });
        }

        const base64Data = fileBuffer.toString('base64');
        const fieldMap = {
            businessLicense: { name: 'Business License', ext: 'pdf', mime: 'application/pdf' },
            taxIdDocument: { name: 'Tax ID Document', ext: 'pdf', mime: 'application/pdf' },
            incorporationCertificate: { name: 'Incorporation Certificate', ext: 'pdf', mime: 'application/pdf' },
            authorizedRepId: { name: 'Authorized Representative ID', ext: 'pdf', mime: 'application/pdf' },
            bankAccountProof: { name: 'Bank Account Proof', ext: 'pdf', mime: 'application/pdf' },
            financialAudit: { name: 'Financial Audit', ext: 'pdf', mime: 'application/pdf' },
            codeOfConduct: { name: 'Code of Conduct', ext: 'pdf', mime: 'application/pdf' },
            finalReport: { name: 'Final Report', ext: 'pdf', mime: 'application/pdf' }
        };

        res.status(200).json({
            success: true,
            file: {
                name: fieldMap[field].name,
                ext: fieldMap[field].ext,
                mime: fieldMap[field].mime,
                base64: base64Data
            }
        });
    } catch (error) {
        console.error('Error fetching file:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch file' });
    }
}

// Approve a corporate partner document
async function approveCorporateDocument(req, res) {
    try {
        const { cpId } = req.params;
        const { field } = req.body;
        const validFields = [
            'businessLicense', 'taxIdDocument', 'incorporationCertificate',
            'authorizedRepId', 'bankAccountProof', 'financialAudit', 'codeOfConduct'
        ];
        if (!validFields.includes(field)) {
            return res.status(400).json({ success: false, message: 'Invalid file field' });
        }

        const corporatePartner = await CorporatePartner.findById(cpId);
        if (!corporatePartner) {
            return res.status(404).json({ success: false, message: 'Corporate Partner not found' });
        }

        if (!corporatePartner.verificationStatus || corporatePartner.verificationStatus[field] !== 'Pending') {
            return res.status(400).json({ success: false, message: 'Document is not in Pending status' });
        }

        corporatePartner.verificationStatus[field] = 'Verified';
        await corporatePartner.save();

        res.status(200).json(corporatePartner);
    } catch (error) {
        console.error('Error approving document:', error);
        res.status(500).json({ success: false, message: 'Failed to approve document' });
    }
}

// Disapprove a corporate partner document
async function disapproveCorporateDocument(req, res) {
    try {
        const { cpId } = req.params;
        const { field } = req.body;
        const validFields = [
            'businessLicense', 'taxIdDocument', 'incorporationCertificate',
            'authorizedRepId', 'bankAccountProof', 'financialAudit', 'codeOfConduct'
        ];
        if (!validFields.includes(field)) {
            return res.status(400).json({ success: false, message: 'Invalid file field' });
        }

        const corporatePartner = await CorporatePartner.findById(cpId);
        if (!corporatePartner) {
            return res.status(404).json({ success: false, message: 'Corporate Partner not found' });
        }

        if (!corporatePartner.verificationStatus || corporatePartner.verificationStatus[field] !== 'Pending') {
            return res.status(400).json({ success: false, message: 'Document is not in Pending status' });
        }

        corporatePartner.verificationStatus[field] = 'Rejected';
        await corporatePartner.save();

        res.status(200).json(corporatePartner);
    } catch (error) {
        console.error('Error disapproving document:', error);
        res.status(500).json({ success: false, message: 'Failed to disapprove document' });
    }
}

// Final approval for corporate partner
async function finalApproveCorporate(req, res) {
    try {
        const { cpId } = req.params;
        const corporatePartner = await CorporatePartner.findById(cpId);
        if (!corporatePartner) {
            return res.status(404).json({ success: false, message: 'Corporate Partner not found' });
        }

        if (!corporatePartner.verificationStatus || !corporatePartner.verificationStatus.finalReport) {
            return res.status(400).json({ success: false, message: 'Final report not uploaded' });
        }

        corporatePartner.verificationStatus.finalReport = 'Verified';
        corporatePartner.documentUploadStatus = 'verified'; // Update overall status
        await corporatePartner.save();

        console.log(`Final Approval Submitted: ${corporatePartner.name} - Final Report: Verified`);

        res.status(200).json(corporatePartner);
    } catch (error) {
        console.error('Error submitting final approval:', error);
        res.status(500).json({ success: false, message: 'Failed to submit final approval' });
    }
}

// Final disapproval for corporate partner
async function finalDisapproveCorporate(req, res) {
    try {
        const { cpId } = req.params;
        const corporatePartner = await CorporatePartner.findById(cpId);
        if (!corporatePartner) {
            return res.status(404).json({ success: false, message: 'Corporate Partner not found' });
        }

        if (!corporatePartner.verificationStatus || !corporatePartner.verificationStatus.finalReport) {
            return res.status(400).json({ success: false, message: 'Final report not uploaded' });
        }

        corporatePartner.verificationStatus.finalReport = 'Rejected';
        corporatePartner.documentUploadStatus = 'rejected'; // Update overall status
        await corporatePartner.save();

        console.log(`Final Disapproval Submitted: ${corporatePartner.name} - Final Report: Rejected`);

        res.status(200).json(corporatePartner);
    } catch (error) {
        console.error('Error submitting final disapproval:', error);
        res.status(500).json({ success: false, message: 'Failed to submit final disapproval' });
    }
}

// Upload final verification report for corporate partner
async function uploadCorporateFinalReport(req, res) {
    try {
        const { cpId } = req.params;
        const corporatePartner = await CorporatePartner.findById(cpId);
        if (!corporatePartner) {
            return res.status(404).json({ success: false, message: 'Corporate Partner not found' });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        corporatePartner.files = corporatePartner.files || {};
        corporatePartner.files.finalReport = req.file.buffer;
        corporatePartner.verificationStatus = corporatePartner.verificationStatus || {};
        corporatePartner.verificationStatus.finalReport = 'Received';
        await corporatePartner.save();

        res.status(200).json(corporatePartner);
    } catch (error) {
        console.error('Error uploading report:', error);
        res.status(500).json({ success: false, message: 'Failed to upload verification report' });
    }
}

// Fetch current corporate partner's details
async function getCurrentCorporate(req, res) {
    try {
        const corporateId = req.session.corporatePartner.id;
        if (!mongoose.Types.ObjectId.isValid(corporateId)) {
            return res.status(400).json({ success: false, message: 'Invalid corporate partner ID in session' });
        }

        const corporatePartner = await CorporatePartner.findById(corporateId).select('name email verificationStatus files');
        if (!corporatePartner) {
            return res.status(404).json({ success: false, message: 'Corporate Partner not found' });
        }

        let finalReportBase64 = null;
        if (corporatePartner.files && corporatePartner.files.finalReport) {
            finalReportBase64 = corporatePartner.files.finalReport.toString('base64');
        }

        console.log(`Corporate Partner: ${corporatePartner.name}`);
        const fieldMap = {
            businessLicense: 'Business License',
            taxIdDocument: 'Tax ID Document',
            incorporationCertificate: 'Incorporation Certificate',
            authorizedRepId: 'Authorized Representative ID',
            bankAccountProof: 'Bank Account Proof',
            financialAudit: 'Financial Audit',
            codeOfConduct: 'Code of Conduct',
            finalReport: 'Final Report'
        };

        const documentFields = [
            'businessLicense', 'taxIdDocument', 'incorporationCertificate',
            'authorizedRepId', 'bankAccountProof', 'financialAudit', 'codeOfConduct', 'finalReport'
        ];

        documentFields.forEach(field => {
            const status = corporatePartner.verificationStatus[field] || (field === 'finalReport' ? 'Not Received' : 'Not Uploaded');
            console.log(`${fieldMap[field]}: ${status}`);
        });

        res.status(200).json({
            success: true,
            corporatePartner: {
                id: corporatePartner._id,
                name: corporatePartner.name,
                email: corporatePartner.email,
                verificationStatus: corporatePartner.verificationStatus,
                finalReport: finalReportBase64 ? {
                    name: 'Final Verification Report',
                    ext: 'pdf',
                    mime: 'application/pdf',
                    base64: finalReportBase64
                } : null
            }
        });
    } catch (error) {
        console.error('Error fetching current corporate partner:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch corporate partner details' });
    }
}

// Check corporate partner final report status
async function checkCorporateStatus(req, res) {
    try {
        const corporatePartner = await CorporatePartner.findById(req.session.corporatePartner.id).select('verificationStatus');
        if (!corporatePartner) {
            return res.status(404).json({ success: false, message: 'Corporate Partner not found' });
        }

        const finalReportStatus = corporatePartner.verificationStatus.finalReport;

        res.status(200).json({
            success: true,
            finalReportStatus: finalReportStatus
        });
    } catch (err) {
        console.error('Error checking final report status:', err.message);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
}

module.exports = {
    uploadDietitianFiles,
    getDietitians,
    getDietitianFile,
    approveDietitianDocument,
    disapproveDietitianDocument,
    finalApproveDietitian,
    finalDisapproveDietitian,
    uploadDietitianFinalReport,
    getCurrentDietitian,
    checkDietitianStatus,


    uploadOrganizationFiles,
    getOrganizations,
    getOrganizationFile,
    approveOrganizationDocument,
    disapproveOrganizationDocument,
    finalApproveOrganization,
    finalDisapproveOrganization,
    uploadOrganizationFinalReport,
    getCurrentOrganization,
    checkOrganizationStatus,

    
    uploadCorporateFiles,
    getCorporatePartners,
    getCorporateFile,
    approveCorporateDocument,
    disapproveCorporateDocument,
    finalApproveCorporate,
    finalDisapproveCorporate,
    uploadCorporateFinalReport,
    getCurrentCorporate,
    checkCorporateStatus
};