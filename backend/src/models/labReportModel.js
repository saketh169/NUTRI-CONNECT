const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LabReportSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    dietitianId: {
        type: Schema.Types.ObjectId,
        ref: 'Dietitian'
    },
    clientName: {
        type: String,
        required: true
    },
    clientAge: {
        type: Number,
        required: true
    },
    clientPhone: {
        type: String,
        required: true
    },
    clientAddress: {
        type: String,
        required: true
    },
    submittedCategories: [{
        type: String,
        enum: [
            'Hormonal_Issues',
            'Fitness_Metrics',
            'General_Reports',
            'Blood_Sugar_Focus',
            'Thyroid',
            'Cardiovascular'
        ],
        required: true
    }],
    // Data for each category
    hormonalIssues: {
        testosteroneTotal: { type: Number },
        dheaS: { type: Number },
        cortisol: { type: Number },
        vitaminD: { type: Number }
    },
    fitnessMetrics: {
        heightCm: { type: Number },
        currentWeight: { type: Number },
        bodyFatPercentage: { type: Number },
        activityLevel: {
            type: String,
            enum: ['sedentary', 'light', 'moderate', 'very', 'extra']
        },
        additionalInfo: { type: String }
    },
    generalReports: {
        dateOfReport: { type: Date },
        bmiValue: { type: Number },
        currentWeight: { type: Number },
        heightCm: { type: Number }
    },
    bloodSugarFocus: {
        fastingGlucose: { type: Number },
        hba1c: { type: Number },
        cholesterolTotal: { type: Number },
        triglycerides: { type: Number }
    },
    thyroid: {
        tsh: { type: Number },
        freeT4: { type: Number },
        reverseT3: { type: Number },
        thyroidAntibodies: { type: String }
    },
    cardiovascular: {
        systolicBP: { type: Number },
        diastolicBP: { type: Number },
        spO2: { type: Number },
        restingHeartRate: { type: Number }
    },
    // File uploads - embedded directly in main schema
    uploadedFiles: [{
        fieldName: { type: String, required: true },
        originalName: { type: String, required: true },
        filename: { type: String, required: true },
        data: { type: Buffer, required: true }, // File data as buffer
        size: { type: Number, required: true },
        mimetype: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now }
    }],
    // Status
    status: {
        type: String,
        enum: ['submitted', 'reviewed', 'pending_review'],
        default: 'submitted'
    },
    reviewedBy: {
        dietitianId: { type: Schema.Types.ObjectId, ref: 'Dietitian' },
        dietitianName: { type: String },
        reviewedAt: { type: Date }
    },
    notes: { type: String } // Dietitian notes
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better query performance
LabReportSchema.index({ userId: 1 });
LabReportSchema.index({ createdAt: -1 });
LabReportSchema.index({ status: 1 });
LabReportSchema.index({ dietitianId: 1 });

// Virtual for formatted submission date
LabReportSchema.virtual('formattedDate').get(function() {
    return this.createdAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
});

const LabReport = mongoose.model('LabReport', LabReportSchema);

module.exports = { LabReport };