const { LabReport } = require('../models/labReportModel');
const multer = require('multer');
const path = require('path');

// Configure multer for memory storage (store files in memory as buffers)
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Allow only PDF and image files
        if (file.mimetype === 'application/pdf' ||
            file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF and image files are allowed!'), false);
        }
    }
});

// Middleware for handling multiple file uploads
const uploadFields = upload.fields([
    { name: 'hormonalProfileReport', maxCount: 1 },
    { name: 'endocrineReport', maxCount: 1 },
    { name: 'generalHealthReport', maxCount: 1 },
    { name: 'bloodTestReport', maxCount: 1 },
    { name: 'bloodSugarReport', maxCount: 1 },
    { name: 'diabetesReport', maxCount: 1 },
    { name: 'thyroidReport', maxCount: 1 },
    { name: 'cardiacHealthReport', maxCount: 1 },
    { name: 'cardiovascularReport', maxCount: 1 },
    { name: 'ecgReport', maxCount: 1 }
]);

// Submit lab report
const submitLabReport = async (req, res) => {
    try {
        const {
            clientName,
            clientAge,
            clientPhone,
            clientAddress,
            clientId,
            submittedCategories,
            // Hormonal Issues
            testosteroneTotal,
            dheaS,
            cortisol,
            vitaminD,
            // Fitness Metrics
            heightCm,
            currentWeight,
            bodyFatPercentage,
            activityLevel,
            additionalInfo,
            // General Reports
            dateOfReport,
            bmiValue,
            // Blood Sugar Focus
            fastingGlucose,
            hba1c,
            cholesterolTotal,
            triglycerides,
            // Thyroid
            tsh,
            freeT4,
            reverseT3,
            thyroidAntibodies,
            // Cardiovascular
            systolicBP,
            diastolicBP,
            spO2,
            restingHeartRate
        } = req.body;

        // Validate required clientId
        if (!clientId) {
            return res.status(400).json({
                success: false,
                message: 'Client ID is required'
            });
        }

        // Parse submitted categories if it's a string
        let categoriesArray = [];
        if (typeof submittedCategories === 'string') {
            categoriesArray = JSON.parse(submittedCategories);
        } else if (Array.isArray(submittedCategories)) {
            categoriesArray = submittedCategories;
        }

        // Prepare uploaded files data
        const uploadedFiles = [];

        if (req.files) {
            Object.keys(req.files).forEach(fieldName => {
                const file = req.files[fieldName][0];
                // Generate unique filename for reference
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                const filename = fieldName + '-' + uniqueSuffix + path.extname(file.originalname);

                uploadedFiles.push({
                    fieldName,
                    originalName: file.originalname,
                    filename,
                    data: file.buffer, // Store file data as buffer
                    size: file.size,
                    mimetype: file.mimetype
                });
            });
        }

        // Create lab report data
        const labReportData = {
            userId: clientId, // Using clientId from request as userId
            dietitianId: req.body.dietitianId, // Add dietitian ID if provided
            clientName,
            clientAge: parseInt(clientAge),
            clientPhone,
            clientAddress,
            submittedCategories: categoriesArray,
            uploadedFiles
        };

        // Add category-specific data
        if (categoriesArray.includes('Hormonal_Issues')) {
            labReportData.hormonalIssues = {
                testosteroneTotal: testosteroneTotal ? parseFloat(testosteroneTotal) : undefined,
                dheaS: dheaS ? parseFloat(dheaS) : undefined,
                cortisol: cortisol ? parseFloat(cortisol) : undefined,
                vitaminD: vitaminD ? parseFloat(vitaminD) : undefined
            };
        }

        if (categoriesArray.includes('Fitness_Metrics')) {
            labReportData.fitnessMetrics = {
                heightCm: heightCm ? parseFloat(heightCm) : undefined,
                currentWeight: currentWeight ? parseFloat(currentWeight) : undefined,
                bodyFatPercentage: bodyFatPercentage ? parseFloat(bodyFatPercentage) : undefined,
                activityLevel,
                additionalInfo
            };
        }

        if (categoriesArray.includes('General_Reports')) {
            labReportData.generalReports = {
                dateOfReport: dateOfReport ? new Date(dateOfReport) : undefined,
                bmiValue: bmiValue ? parseFloat(bmiValue) : undefined,
                currentWeight: currentWeight ? parseFloat(currentWeight) : undefined,
                heightCm: heightCm ? parseFloat(heightCm) : undefined
            };
        }

        if (categoriesArray.includes('Blood_Sugar_Focus')) {
            labReportData.bloodSugarFocus = {
                fastingGlucose: fastingGlucose ? parseFloat(fastingGlucose) : undefined,
                hba1c: hba1c ? parseFloat(hba1c) : undefined,
                cholesterolTotal: cholesterolTotal ? parseFloat(cholesterolTotal) : undefined,
                triglycerides: triglycerides ? parseFloat(triglycerides) : undefined
            };
        }

        if (categoriesArray.includes('Thyroid')) {
            labReportData.thyroid = {
                tsh: tsh ? parseFloat(tsh) : undefined,
                freeT4: freeT4 ? parseFloat(freeT4) : undefined,
                reverseT3: reverseT3 ? parseFloat(reverseT3) : undefined,
                thyroidAntibodies
            };
        }

        if (categoriesArray.includes('Cardiovascular')) {
            labReportData.cardiovascular = {
                systolicBP: systolicBP ? parseFloat(systolicBP) : undefined,
                diastolicBP: diastolicBP ? parseFloat(diastolicBP) : undefined,
                spO2: spO2 ? parseFloat(spO2) : undefined,
                restingHeartRate: restingHeartRate ? parseFloat(restingHeartRate) : undefined
            };
        }

        // Create and save lab report
        const labReport = new LabReport(labReportData);
        await labReport.save();

        res.status(201).json({
            success: true,
            message: 'Lab report submitted successfully',
            data: labReport
        });

    } catch (error) {
        console.error('Error submitting lab report:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit lab report',
            error: error.message
        });
    }
};

// Get lab reports for a client (filtered by client and dietitian)
const getClientLabReports = async (req, res) => {
    try {
        const { clientId, dietitianId } = req.params;

        // Build query to filter by both client and dietitian
        const query = {};
        if (clientId) query.userId = clientId;
        if (dietitianId) query.dietitianId = dietitianId;

        const labReports = await LabReport.find(query)
            .sort({ createdAt: -1 })
            .populate('dietitianId', 'name')
            .populate('reviewedBy.dietitianId', 'name');

        res.json({
            success: true,
            data: labReports
        });

    } catch (error) {
        console.error('Error fetching lab reports:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch lab reports',
            error: error.message
        });
    }
};

// Get lab reports for a specific client (for dietitians)
const getLabReportsByClient = async (req, res) => {
    try {
        const { clientId } = req.params;

        const labReports = await LabReport.find({ clientId })
            .sort({ createdAt: -1 })
            .populate('reviewedBy.dietitianId', 'name');

        res.json({
            success: true,
            data: labReports
        });

    } catch (error) {
        console.error('Error fetching lab reports:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch lab reports',
            error: error.message
        });
    }
};

// Update lab report status and add feedback (for dietitians)
const updateLabReportStatus = async (req, res) => {
    try {
        const { reportId } = req.params;
        const { status, feedback } = req.body;

        const updateData = {
            status,
            notes: feedback
        };

        if (status === 'reviewed') {
            updateData.reviewedBy = {
                dietitianId: req.user?.id || req.user?._id || req.body.dietitianId,
                dietitianName: req.user?.name || req.body.dietitianName || 'Unknown Dietitian',
                reviewedAt: new Date()
            };
        }

        const labReport = await LabReport.findByIdAndUpdate(
            reportId,
            updateData,
            { new: true }
        );

        if (!labReport) {
            return res.status(404).json({
                success: false,
                message: 'Lab report not found'
            });
        }

        res.json({
            success: true,
            message: 'Lab report updated successfully',
            data: labReport
        });

    } catch (error) {
        console.error('Error updating lab report:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update lab report',
            error: error.message
        });
    }
};

module.exports = {
    submitLabReport,
    getClientLabReports,
    getLabReportsByClient,
    updateLabReportStatus,
    uploadFields
};