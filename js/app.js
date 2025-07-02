// MedScript Pro - Complete Main Application Logic
class EnhancedSOAPNoteGenerator {
    constructor() {
        // Core properties
        this.recognition = null;
        this.isRecording = false;
        this.currentSpeaker = null;
        this.transcript = [];
        this.sessionId = this.generateSessionId();
        this.sessionStartTime = new Date();
        this.durationTimer = null;
        this.confidenceThreshold = MedScriptConfig.speech.confidenceThreshold;
        this.soapData = this.initializeSoapData();
        this.autoSaveTimer = null;
        this.savedSession = null;
        
        // Initialize the application
        this.initializeApp();
    }
    
    generateSessionId() {
        return 'SOAP-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
    }
    
    initializeSoapData() {
        return {
            subjective: {
                chiefComplaint: '',
                presentIllness: '',
                reviewSystems: '',
                pastMedicalHistory: ''
            },
            objective: {
                vitalSigns: '',
                physicalExam: '',
                diagnosticResults: ''
            },
            assessment: {
                primaryDiagnosis: '',
                differentialDx: '',
                clinicalImpression: ''
            },
            plan: {
                medications: '',
                procedures: '',
                followUp: '',
                patientEducation: ''
            },
            patientInfo: {
                name: '',
                dob: '',
                mrn: ''
            }
        };
    }
    
    initializeApp() {
        this.setupEventListeners();
        this.initializeSpeechRecognition();
        this.updateSessionInfo();
        this.startDurationTimer();
        this.setupAutoSave();
        this.loadSpecialtyTemplates();
        this.setupWordCountTracking();
    }
    
    setupEventListeners() {
        // Recording controls
        document.getElementById('clinicianBtn').addEventListener('click', () => this.startRecording('Clinician'));
        document.getElementById('patientBtn').addEventListener('click', () => this.startRecording('Patient'));
        document.getElementById('pauseBtn').addEventListener('click', () => this.pauseRecording());
        document.getElementById('stopBtn').addEventListener('click', () => this.stopRecording());
        document.getElementById('emergencyStopBtn').addEventListener('click', () => this.emergencyStop());
        
        // SOAP generation and actions
        document.getElementById('generateSoapBtn').addEventListener('click', () => this.generateSOAPNote());
        document.getElementById('printSoapBtn').addEventListener('click', () => this.printSOAPNote());
        document.getElementById('exportSoapBtn').addEventListener('click', () => this.exportSOAPNote());
        document.getElementById('clearSoapBtn').addEventListener('click', () => this.clearSOAPNote());
        document.getElementById('validateSoapBtn').addEventListener('click', () => this.validateSOAPNote());
        
        // UI controls
        document.getElementById('medicalSpecialty').addEventListener('change', () => this.onSpecialtyChange());
        document.getElementById('settingsBtn').addEventListener('click', () => this.showNotification('info', 'Settings', 'Settings panel coming soon'));
        document.getElementById('newSessionBtn').addEventListener('click', () => this.startNewSession());
        document.getElementById('loadTemplateBtn').addEventListener('click', () => this.showTemplatesModal());
        document.getElementById('aiSuggestionsBtn').addEventListener('click', () => this.toggleAISuggestions());
        document.getElementById('templatesBtn').addEventListener('click', () => this.showTemplatesModal());
        
        // Modal controls
        document.getElementById('closeTemplatesModal').addEventListener('click', () => this.hideTemplatesModal());
        document.getElementById('closeSuggestionsPanel').addEventListener('click', () => this.hideAISuggestions());
        
        // Transcript controls
        document.getElementById('searchTranscriptBtn').addEventListener('click', () => this.searchTranscript());
        document.getElementById('exportTranscriptBtn').addEventListener('click', () => this.exportTranscript());
    }

    setupWordCountTracking() {
        const fields = [
            'chiefComplaint', 'presentIllness', 'reviewSystems', 'pastMedicalHistory',
            'vitalSigns', 'physicalExam', 'diagnosticResults',
            'primaryDiagnosis', 'differentialDx', 'clinicalImpression',
            'medications', 'procedures', 'followUp', 'patientEducation'
        ];

        fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('input', () => this.updateWordCount(fieldId));
            }
        });
    }

    updateWordCount(fieldId) {
        const field = document.getElementById(fieldId);
        const text = field.textContent.trim();
        const wordCount = text ? text.split(/\s+/).length : 0;
        
        const countElementId = this.getWordCountElementId(fieldId);
        const countElement = document.getElementById(countElementId);
        if (countElement) {
            countElement.textContent = `${wordCount} words`;
        }
    }

    getWordCountElementId(fieldId) {
        const mapping = {
            'chiefComplaint': 'ccWordCount',
            'presentIllness': 'hpiWordCount',
            'reviewSystems': 'rosWordCount',
            'pastMedicalHistory': 'pmhWordCount',
            'vitalSigns': 'vitalsWordCount',
            'physicalExam': 'examWordCount',
            'diagnosticResults': 'diagWordCount',
            'primaryDiagnosis': 'primaryDxWordCount',
            'differentialDx': 'diffDxWordCount',
            'clinicalImpression': 'impressionWordCount',
            'medications': 'medsWordCount',
            'procedures': 'procWordCount',
            'followUp': 'followUpWordCount',
            'patientEducation': 'educationWordCount'
        };
        return mapping[fieldId];
    }

    setupAutoSave() {
        setInterval(() => {
            this.autoSave();
        }, MedScriptConfig.app.autoSaveInterval);
    }

    autoSave() {
        const soapData = this.collectSOAPData();
        const sessionData = {
            soapData,
            transcript: this.transcript,
            sessionId: this.sessionId,
            lastModified: new Date().toISOString(),
            specialty: document.getElementById('medicalSpecialty').value
        };

        try {
            this.savedSession = sessionData;
            this.showAutoSaveIndicator('saved');
            document.getElementById('lastModified').textContent = new Date().toLocaleTimeString();
        } catch (error) {
            console.error('Auto-save failed:', error);
            this.showAutoSaveIndicator('error');
        }
    }

    showAutoSaveIndicator(status) {
        const indicator = document.getElementById('autoSaveIndicator');
        indicator.className = `auto-save-indicator ${status}`;
        
        const icons = {
            saving: '<i class="fas fa-sync fa-spin text-xs"></i>',
            saved: '<i class="fas fa-check text-xs"></i>',
            error: '<i class="fas fa-exclamation-triangle text-xs"></i>'
        };
        
        const labels = {
            saving: 'Saving...',
            saved: 'Saved',
            error: 'Error'
        };

        indicator.innerHTML = `${icons[status]} <span>${labels[status]}</span>`;
    }

    startNewSession() {
        if (confirm('Start a new session? Any unsaved changes will be lost.')) {
            this.sessionId = this.generateSessionId();
            this.sessionStartTime = new Date();
            this.transcript = [];
            this.clearSOAPNote();
            this.updateSessionInfo();
            this.showNotification('success', 'New Session', 'Started new SOAP note session');
        }
    }

    showTemplatesModal() {
        const modal = document.getElementById('templatesModal');
        const grid = document.getElementById('templatesGrid');
        
        grid.innerHTML = '';
        
        Object.entries(MedScriptTemplates.soapTemplates).forEach(([name, template]) => {
            const card = document.createElement('div');
            card.className = 'template-card';
            card.innerHTML = `
                <h4 class="font-semibold text-gray-900 mb-2">${name}</h4>
                <p class="text-sm text-gray-600 mb-2">Specialty: ${template.specialty}</p>
                <p class="text-xs text-gray-500">${template.description}</p>
            `;
            card.addEventListener('click', () => this.loadTemplate(template));
            grid.appendChild(card);
        });
        
        modal.classList.remove('hidden');
    }

    hideTemplatesModal() {
        document.getElementById('templatesModal').classList.add('hidden');
    }

    loadTemplate(template) {
        if (template.specialty) {
            document.getElementById('medicalSpecialty').value = template.specialty;
            this.onSpecialtyChange();
        }

        Object.entries(template).forEach(([section, data]) => {
            if (section !== 'specialty' && section !== 'description' && typeof data === 'object') {
                Object.entries(data).forEach(([field, value]) => {
                    const element = document.getElementById(field);
                    if (element && value) {
                        element.textContent = value;
                        this.updateWordCount(field);
                    }
                });
            }
        });

        this.hideTemplatesModal();
        this.showNotification('success', 'Template Loaded', 'SOAP note template applied successfully');
        this.autoSave();
    }

    toggleAISuggestions() {
        const panel = document.getElementById('aiSuggestionsPanel');
        if (panel.classList.contains('hidden')) {
            this.generateAISuggestions();
            panel.classList.remove('hidden');
        } else {
            panel.classList.add('hidden');
        }
    }

    hideAISuggestions() {
        document.getElementById('aiSuggestionsPanel').classList.add('hidden');
    }

    async generateAISuggestions() {
        const content = document.getElementById('suggestionsContent');
        content.innerHTML = '<div class="text-center py-4"><i class="fas fa-spinner fa-spin text-purple-600"></i> Generating suggestions...</div>';

        try {
            const currentData = this.collectSOAPData();
            const suggestions = await this.getAISuggestions(currentData);
            this.displaySuggestions(suggestions);
        } catch (error) {
            content.innerHTML = '<div class="text-red-600">Error generating suggestions. Please check your configuration.</div>';
        }
    }

    displaySuggestions(suggestions) {
        const content = document.getElementById('suggestionsContent');
        content.innerHTML = '';

        suggestions.forEach(suggestion => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.innerHTML = `
                <div class="font-medium text-purple-800">${suggestion.section}</div>
                <div class="text-sm text-gray-700">${suggestion.text}</div>
            `;
            item.addEventListener('click', () => this.applySuggestion(suggestion));
            content.appendChild(item);
        });
    }

    applySuggestion(suggestion) {
        const fieldMapping = {
            'Chief Complaint': 'chiefComplaint',
            'HPI': 'presentIllness',
            'Physical Exam': 'physicalExam',
            'Assessment': 'primaryDiagnosis',
            'Plan': 'medications'
        };

        const fieldId = fieldMapping[suggestion.section];
        if (fieldId) {
            const field = document.getElementById(fieldId);
            if (field) {
                field.textContent = suggestion.text;
                this.updateWordCount(fieldId);
                this.autoSave();
                this.showNotification('success', 'Suggestion Applied', `${suggestion.section} updated`);
            }
        }
    }

    validateSOAPNote() {
        const issues = [];
        const requiredFields = MedScriptConfig.validation.requiredFields;

        requiredFields.forEach(field => {
            const element = document.getElementById(field.id);
            if (!element || element.textContent.trim().length < field.minLength) {
                issues.push(`${field.name} needs more detail (minimum ${field.minLength} characters)`);
            }
        });

        if (issues.length === 0) {
            this.showNotification('success', 'Validation Passed', 'SOAP note meets quality standards');
        } else {
            this.showNotification('warning', 'Validation Issues', `${issues.length} items need attention`);
            console.log('Validation issues:', issues);
        }
    }

    searchTranscript() {
        const query = prompt('Search transcript for:');
        if (query) {
            const results = this.transcript.filter(entry => 
                entry.text.toLowerCase().includes(query.toLowerCase())
            );
            
            if (results.length > 0) {
                this.showNotification('info', 'Search Results', `Found ${results.length} matches`);
                this.highlightTranscriptResults(query);
            } else {
                this.showNotification('info', 'No Results', 'No matches found in transcript');
            }
        }
    }

    highlightTranscriptResults(query) {
        const container = document.getElementById('transcriptContainer');
        const html = container.innerHTML;
        const highlightedHtml = html.replace(
            new RegExp(query, 'gi'), 
            `<mark style="background-color: yellow;">$&</mark>`
        );
        container.innerHTML = highlightedHtml;
        
        setTimeout(() => {
            container.innerHTML = html;
        }, 5000);
    }

    exportTranscript() {
        const transcriptText = this.transcript
            .map(entry => `[${new Date(entry.timestamp).toLocaleTimeString()}] ${entry.speaker}: ${entry.text}`)
            .join('\n');
        
        this.downloadFile(transcriptText, 'text/plain', `transcript-${this.sessionId}.txt`);
        this.showNotification('success', 'Transcript Exported', 'File downloaded successfully');
    }

    collectSOAPData() {
        return {
            patientInfo: {
                name: document.getElementById('patientName').textContent,
                dob: document.getElementById('patientDOB').textContent,
                mrn: document.getElementById('patientMRN').textContent
            },
            subjective: {
                chiefComplaint: document.getElementById('chiefComplaint').textContent,
                presentIllness: document.getElementById('presentIllness').textContent,
                reviewSystems: document.getElementById('reviewSystems').textContent,
                pastMedicalHistory: document.getElementById('pastMedicalHistory').textContent
            },
            objective: {
                vitalSigns: document.getElementById('vitalSigns').textContent,
                physicalExam: document.getElementById('physicalExam').textContent,
                diagnosticResults: document.getElementById('diagnosticResults').textContent
            },
            assessment: {
                primaryDiagnosis: document.getElementById('primaryDiagnosis').textContent,
                differentialDx: document.getElementById('differentialDx').textContent,
                clinicalImpression: document.getElementById('clinicalImpression').textContent
            },
            plan: {
                medications: document.getElementById('medications').textContent,
                procedures: document.getElementById('procedures').textContent,
                followUp: document.getElementById('followUp').textContent,
                patientEducation: document.getElementById('patientEducation').textContent
            }
        };
    }

    async getAISuggestions(currentData) {
        // Return contextual suggestions based on current data
        const suggestions = [];
        
        if (!currentData.subjective.chiefComplaint || currentData.subjective.chiefComplaint.length < 20) {
            suggestions.push({
                section: 'Chief Complaint',
                text: 'Consider adding onset, duration, and severity details to the chief complaint'
            });
        }
        
        if (!currentData.objective.physicalExam || currentData.objective.physicalExam.length < 30) {
            suggestions.push({
                section: 'Physical Exam',
                text: 'Include vital signs and systematic examination findings by body systems'
            });
        }
        
        if (!currentData.assessment.primaryDiagnosis || currentData.assessment.primaryDiagnosis.length < 10) {
            suggestions.push({
                section: 'Assessment',
                text: 'Consider differential diagnoses and include ICD-10 codes for primary diagnosis'
            });
        }
        
        if (!currentData.plan.medications || currentData.plan.medications.length < 15) {
            suggestions.push({
                section: 'Plan',
                text: 'Include specific medications with dosages, procedures, and follow-up instructions'
            });
        }
        
        return suggestions;
    }

    // Speech Recognition Methods
    initializeSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            this.recognition.continuous = MedScriptConfig.speech.continuous;
            this.recognition.interimResults = MedScriptConfig.speech.interimResults;
            this.recognition.lang = MedScriptConfig.speech.language;
            this.recognition.maxAlternatives = MedScriptConfig.speech.maxAlternatives;
            
            this.recognition.onstart = () => {
                this.isRecording = true;
                this.updateRecordingUI();
                this.showNotification('success', 'Recording Started', `Now recording ${this.currentSpeaker}`);
            };
            
            this.recognition.onresult = (event) => {
                this.processRecognitionResult(event);
            };
            
            this.recognition.onend = () => {
                if (this.isRecording && this.currentSpeaker) {
                    setTimeout(() => this.recognition.start(), 100);
                }
            };
            
            this.recognition.onerror = (event) => {
                this.handleRecognitionError(event);
            };
        } else {
            this.showNotification('error', 'Not Supported', 'Speech recognition not supported in this browser');
        }
    }
    
    startRecording(speaker) {
        if (this.isRecording && this.currentSpeaker === speaker) return;
        
        if (this.isRecording) {
            this.recognition.stop();
        }
        
        this.currentSpeaker = speaker;
        if (this.recognition) {
            this.recognition.start();
        }
    }
    
    pauseRecording() {
        if (this.isRecording) {
            this.recognition.stop();
            this.isRecording = false;
            this.updateRecordingUI();
            this.showNotification('info', 'Recording Paused', 'Click a speaker to resume');
        }
    }
    
    stopRecording() {
        this.isRecording = false;
        this.currentSpeaker = null;
        if (this.recognition) {
            this.recognition.stop();
        }
        this.updateRecordingUI();
        this.showNotification('info', 'Recording Stopped', 'Ready to generate SOAP note');
    }
    
    emergencyStop() {
        this.stopRecording();
        this.showNotification('warning', 'Emergency Stop', 'All recording stopped immediately');
    }
    
    processRecognitionResult(event) {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            const transcript = result[0].transcript;
            const confidence = result[0].confidence || 0;
            
            if (result.isFinal) {
                if (!this.processVoiceCommand(transcript)) {
                    if (confidence >= this.confidenceThreshold) {
                        finalTranscript += transcript;
                        this.addToTranscript(this.currentSpeaker, transcript, confidence);
                    }
                }
            } else {
                interimTranscript += transcript;
            }
        }
        
        this.updateTranscriptDisplay(interimTranscript);
    }
    
    processVoiceCommand(text) {
        const command = text.toLowerCase().trim();
        const voiceCommands = MedScriptConfig.voiceCommands;
        
        if (voiceCommands[command]) {
            const methodName = voiceCommands[command];
            if (this[methodName]) {
                this[methodName]();
                return true;
            }
        }
        return false;
    }

    switchToPatient() {
        this.startRecording('Patient');
    }

    switchToClinician() {
        this.startRecording('Clinician');
    }

    addParagraphBreak() {
        if (this.currentSpeaker && this.transcript.length > 0) {
            const lastEntry = this.transcript[this.transcript.length - 1];
            if (lastEntry.speaker === this.currentSpeaker) {
                lastEntry.text += '\n\n';
                this.updateTranscriptDisplay();
            }
        }
    }
    
    addToTranscript(speaker, text, confidence) {
        const entry = {
            id: this.generateEntryId(),
            speaker: speaker,
            text: text.trim(),
            timestamp: new Date().toISOString(),
            confidence: confidence
        };
        
        this.transcript.push(entry);
        this.updateMessageCount();
        this.updateTranscriptDisplay();
        this.updateSOAPProgress();
        this.updateTranscriptStats();
    }
    
    generateEntryId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }

    updateTranscriptStats() {
        const totalWords = this.transcript.reduce((count, entry) => {
            return count + entry.text.split(/\s+/).length;
        }, 0);
        
        const avgConfidence = this.transcript.length > 0 ? 
            this.transcript.reduce((sum, entry) => sum + entry.confidence, 0) / this.transcript.length : 0;
        
        document.getElementById('transcriptWordCount').textContent = `${totalWords} words`;
        document.getElementById('transcriptConfidence').textContent = 
            `Average confidence: ${Math.round(avgConfidence * 100)}%`;
    }
    
    updateTranscriptDisplay(interimText = '') {
        const container = document.getElementById('transcriptContainer');
        let html = '';
        
        this.transcript.forEach((entry, index) => {
            const speakerClass = entry.speaker === 'Clinician' ? 'clinician' : 'patient';
            const confidenceClass = entry.confidence > 0.8 ? 'confidence-high' : 
                                  entry.confidence > 0.6 ? 'confidence-medium' : 'confidence-low';
            
            const timeString = new Date(entry.timestamp).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit' 
            });
            
            html += `
                <div class="timeline-item ${speakerClass} mb-4">
                    <div class="flex items-start space-x-3">
                        <div class="w-8 h-8 ${entry.speaker === 'Clinician' ? 'bg-blue-100' : 'bg-green-100'} rounded-full flex items-center justify-center flex-shrink-0">
                            <i class="fas ${entry.speaker === 'Clinician' ? 'fa-user-md' : 'fa-user'} ${entry.speaker === 'Clinician' ? 'text-blue-600' : 'text-green-600'} text-xs"></i>
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center justify-between mb-1">
                                <h4 class="text-sm font-medium text-gray-900">${entry.speaker}</h4>
                                <div class="flex items-center space-x-2">
                                    <span class="text-xs text-gray-500">${timeString}</span>
                                    <div class="confidence-indicator ${confidenceClass}" title="Confidence: ${Math.round(entry.confidence * 100)}%"></div>
                                </div>
                            </div>
                            <p class="text-gray-700 text-sm leading-relaxed">${entry.text}</p>
                        </div>
                    </div>
                </div>
            `;
        });
        
        if (interimText && this.currentSpeaker) {
            const speakerClass = this.currentSpeaker === 'Clinician' ? 'clinician' : 'patient';
            html += `
                <div class="timeline-item ${speakerClass} mb-4 opacity-60">
                    <div class="flex items-start space-x-3">
                        <div class="w-8 h-8 ${this.currentSpeaker === 'Clinician' ? 'bg-blue-100' : 'bg-green-100'} rounded-full flex items-center justify-center flex-shrink-0">
                            <i class="fas ${this.currentSpeaker === 'Clinician' ? 'fa-user-md' : 'fa-user'} ${this.currentSpeaker === 'Clinician' ? 'text-blue-600' : 'text-green-600'} text-xs"></i>
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center justify-between mb-1">
                                <h4 class="text-sm font-medium text-gray-900">${this.currentSpeaker}</h4>
                                <span class="text-xs text-gray-400 italic">speaking...</span>
                            </div>
                            <p class="text-gray-500 text-sm leading-relaxed italic">${interimText}</p>
                        </div>
                    </div>
                </div>
            `;
        }
        
        if (this.transcript.length === 0 && !interimText) {
            html = `
                <div class="text-center text-gray-500 py-8">
                    <i class="fas fa-microphone-slash text-2xl mb-3 opacity-50"></i>
                    <p class="text-sm">Start recording to see transcript</p>
                </div>
            `;
        }
        
        container.innerHTML = html;
        container.scrollTop = container.scrollHeight;
    }
    
    updateRecordingUI() {
        const clinicianBtn = document.getElementById('clinicianBtn');
        const patientBtn = document.getElementById('patientBtn');
        const clinicianIcon = document.getElementById('clinicianIcon');
        const patientIcon = document.getElementById('patientIcon');
        const audioViz = document.getElementById('audioVisualization');
        const pauseBtn = document.getElementById('pauseBtn');
        const stopBtn = document.getElementById('stopBtn');
        const status = document.getElementById('recordingStatus');
        
        // Reset all states
        clinicianIcon.className = 'fas fa-user-md text-2xl text-white';
        patientIcon.className = 'fas fa-user text-2xl text-white';
        
        if (this.isRecording && this.currentSpeaker) {
            audioViz.style.opacity = '1';
            pauseBtn.classList.remove('hidden');
            stopBtn.classList.remove('hidden');
            
            if (this.currentSpeaker === 'Clinician') {
                clinicianIcon.className = 'fas fa-microphone text-2xl text-white recording-pulse';
                status.textContent = 'Recording: Clinician speaking...';
            } else {
                patientIcon.className = 'fas fa-microphone text-2xl text-white recording-pulse';
                status.textContent = 'Recording: Patient speaking...';
            }
        } else {
            audioViz.style.opacity = '0';
            pauseBtn.classList.add('hidden');
            stopBtn.classList.add('hidden');
            status.textContent = 'Ready to start recording';
        }
    }
    
    updateSOAPProgress() {
        const totalSections = 12; // Total SOAP subsections
        let filledSections = 0;
        
        // Count non-empty sections
        Object.values(this.soapData).forEach(section => {
            if (typeof section === 'object') {
                Object.values(section).forEach(field => {
                    if (field && field.trim().length > 0) filledSections++;
                });
            }
        });
        
        const percentage = Math.round((filledSections / totalSections) * 100);
        document.getElementById('soapProgress').textContent = `${percentage}%`;
        document.getElementById('soapProgressBar').style.width = `${percentage}%`;
    }
    
    // AI Processing Methods
    async generateSOAPNote() {
        if (this.transcript.length === 0) {
            this.showNotification('warning', 'No Data', 'No conversation to analyze');
            return;
        }
        
        const quality = document.getElementById('qualityLevel').value;
        const specialty = document.getElementById('medicalSpecialty').value;
        
        try {
            this.showSOAPGenerationLoading();
            this.showNotification('info', 'Processing', 'Generating SOAP note with AI...');
            
            const conversationText = this.transcript
                .map(entry => `${entry.speaker}: ${entry.text}`)
                .join('\n');
            
            const soapNote = await this.processWithAI(conversationText, specialty, quality);
            this.populateSOAPNote(soapNote);
            this.showNotification('success', 'SOAP Note Generated', 'Medical analysis complete');
            this.autoSave();
            
        } catch (error) {
            console.error('SOAP generation error:', error);
            this.showNotification('error', 'Generation Failed', 'AI processing failed. Please try again.');
        }
    }
    
    async processWithAI(conversationText, specialty, quality) {
        const specialtyContext = MedScriptConfig.specialties[specialty] || MedScriptConfig.specialties.general;
        const qualityPrompt = MedScriptConfig.qualityPrompts[quality];
        
        const prompt = `
            You are an expert ${specialtyContext.context} physician. Analyze this doctor-patient conversation and create a comprehensive SOAP note.
            
            ${qualityPrompt}
            
            IMPORTANT: Return ONLY a valid JSON object with the following exact structure (no additional text, explanations, or markdown):
            
            {
                "patientInfo": {
                    "name": "extracted or 'Patient Name'",
                    "dob": "extracted or 'MM/DD/YYYY'",
                    "mrn": "extracted or 'MRN'"
                },
                "subjective": {
                    "chiefComplaint": "patient's main concern in their words",
                    "presentIllness": "detailed history of current symptoms with timeline, quality, severity, associated symptoms",
                    "reviewSystems": "systematic review organized by body systems",
                    "pastMedicalHistory": "relevant past medical conditions, surgeries, hospitalizations"
                },
                "objective": {
                    "vitalSigns": "blood pressure, heart rate, temperature, respiratory rate, oxygen saturation if mentioned",
                    "physicalExam": "detailed physical examination findings organized by body systems",
                    "diagnosticResults": "laboratory results, imaging studies, other diagnostic tests mentioned"
                },
                "assessment": {
                    "primaryDiagnosis": "most likely diagnosis with ICD-10 code if applicable",
                    "differentialDx": "other possible diagnoses to consider",
                    "clinicalImpression": "clinical reasoning and overall assessment"
                },
                "plan": {
                    "medications": "prescribed medications with dosages, frequencies, and durations",
                    "procedures": "procedures ordered or performed",
                    "followUp": "follow-up appointments and monitoring plans",
                    "patientEducation": "education provided and lifestyle recommendations"
                }
            }
            
            For ${specialtyContext.context}, pay special attention to ${specialtyContext.focus}.
            
            Conversation transcript:
            ${conversationText}
        `;
        
        try {
            // Try primary AI provider
            return await this.callAI(MedScriptConfig.ai.primary.apiKey, MedScriptConfig.ai.primary.provider, prompt, MedScriptConfig.ai.primary.model);
        } catch (error) {
            console.warn('Primary AI provider failed, trying fallback:', error);
            try {
                // Try fallback provider
                return await this.callAI(MedScriptConfig.ai.fallback.apiKey, MedScriptConfig.ai.fallback.provider, prompt, MedScriptConfig.ai.fallback.model);
            } catch (fallbackError) {
                console.error('Both AI providers failed:', fallbackError);
                // Return a mock response for demo purposes
                return this.generateMockSOAPResponse(conversationText, specialty);
            }
        }
    }

    async callAI(apiKey, provider, prompt, model) {
        if (!apiKey || apiKey === 'your-openai-api-key-here' || apiKey === 'your-anthropic-api-key-here') {
            throw new Error('API key not configured');
        }

        switch (provider) {
            case 'openai':
                return await this.callOpenAI(apiKey, prompt, model);
            case 'anthropic':
                return await this.callAnthropic(apiKey, prompt, model);
            default:
                throw new Error('Unsupported AI provider');
        }
    }

    generateMockSOAPResponse(conversationText, specialty) {
        // Use the mock generator from templates
        return JSON.stringify(TemplateUtils.generateMockSOAP(specialty));
    }

    async callOpenAI(apiKey, prompt, model = 'gpt-4') {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model,
                messages: [{ role: 'user', content: prompt }],
                temperature: MedScriptConfig.ai.settings.temperature,
                max_tokens: MedScriptConfig.ai.settings.maxTokens
            })
        });
        
        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status}`);
        }
        
        const data = await response.json();
        return data.choices[0].message.content;
    }
    
    async callAnthropic(apiKey, prompt, model = 'claude-3-sonnet-20240229') {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: model,
                max_tokens: MedScriptConfig.ai.settings.maxTokens,
                messages: [{ role: 'user', content: prompt }]
            })
        });
        
        if (!response.ok) {
            throw new Error(`Anthropic API error: ${response.status}`);
        }
        
        const data = await response.json();
        return data.content[0].text;
    }
    
    showSOAPGenerationLoading() {
        const sections = ['chiefComplaint', 'presentIllness', 'reviewSystems', 'pastMedicalHistory',
                        'vitalSigns', 'physicalExam', 'diagnosticResults',
                        'primaryDiagnosis', 'differentialDx', 'clinicalImpression',
                        'medications', 'procedures', 'followUp', 'patientEducation'];
        
        sections.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.innerHTML = '<i class="fas fa-spinner fa-spin text-blue-500"></i> Generating...';
            }
        });
    }
    
    populateSOAPNote(soapText) {
        try {
            // Extract JSON from response
            const jsonMatch = soapText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No valid JSON found in AI response');
            }
            
            const soapData = JSON.parse(jsonMatch[0]);
            this.soapData = soapData;
            
            // Populate patient information
            if (soapData.patientInfo) {
                this.setFieldContent('patientName', soapData.patientInfo.name);
                this.setFieldContent('patientDOB', soapData.patientInfo.dob);
                this.setFieldContent('patientMRN', soapData.patientInfo.mrn);
            }
            
            // Populate SOAP sections
            if (soapData.subjective) {
                this.setFieldContent('chiefComplaint', soapData.subjective.chiefComplaint);
                this.setFieldContent('presentIllness', soapData.subjective.presentIllness);
                this.setFieldContent('reviewSystems', soapData.subjective.reviewSystems);
                this.setFieldContent('pastMedicalHistory', soapData.subjective.pastMedicalHistory);
            }
            
            if (soapData.objective) {
                this.setFieldContent('vitalSigns', soapData.objective.vitalSigns);
                this.setFieldContent('physicalExam', soapData.objective.physicalExam);
                this.setFieldContent('diagnosticResults', soapData.objective.diagnosticResults);
            }
            
            if (soapData.assessment) {
                this.setFieldContent('primaryDiagnosis', soapData.assessment.primaryDiagnosis);
                this.setFieldContent('differentialDx', soapData.assessment.differentialDx);
                this.setFieldContent('clinicalImpression', soapData.assessment.clinicalImpression);
            }
            
            if (soapData.plan) {
                this.setFieldContent('medications', soapData.plan.medications);
                this.setFieldContent('procedures', soapData.plan.procedures);
                this.setFieldContent('followUp', soapData.plan.followUp);
                this.setFieldContent('patientEducation', soapData.plan.patientEducation);
            }
            
            // Update word counts for all fields
            const allFields = ['chiefComplaint', 'presentIllness', 'reviewSystems', 'pastMedicalHistory',
                             'vitalSigns', 'physicalExam', 'diagnosticResults',
                             'primaryDiagnosis', 'differentialDx', 'clinicalImpression',
                             'medications', 'procedures', 'followUp', 'patientEducation'];
            
            allFields.forEach(fieldId => this.updateWordCount(fieldId));
            this.updateSOAPProgress();
            
        } catch (error) {
            console.error('Error populating SOAP note:', error);
            this.showNotification('error', 'Parse Error', 'Failed to parse AI response');
            
            // Fallback: display raw text
            document.getElementById('chiefComplaint').innerHTML = soapText;
        }
    }
    
    setFieldContent(fieldId, content) {
        const field = document.getElementById(fieldId);
        if (field && content) {
            field.textContent = content;
            field.style.borderStyle = 'solid';
            field.style.borderColor = '#10b981';
        }
    }
    
    // Export and Utility Methods
    printSOAPNote() {
        window.print();
    }
    
    exportSOAPNote() {
        const soapNote = this.generateSOAPExport();
        this.downloadFile(
            JSON.stringify(soapNote, null, 2),
            'application/json',
            `soap-note-${this.sessionId}.json`
        );
        this.showNotification('success', 'SOAP Note Exported', 'File downloaded successfully');
    }
    
    generateSOAPExport() {
        return {
            metadata: {
                sessionId: this.sessionId,
                generatedAt: new Date().toISOString(),
                specialty: document.getElementById('medicalSpecialty').value,
                provider: 'MedScript Pro Enhanced'
            },
            patientInfo: {
                name: document.getElementById('patientName').textContent,
                dob: document.getElementById('patientDOB').textContent,
                mrn: document.getElementById('patientMRN').textContent
            },
            soap: {
                subjective: {
                    chiefComplaint: document.getElementById('chiefComplaint').textContent,
                    presentIllness: document.getElementById('presentIllness').textContent,
                    reviewSystems: document.getElementById('reviewSystems').textContent,
                    pastMedicalHistory: document.getElementById('pastMedicalHistory').textContent
                },
                objective: {
                    vitalSigns: document.getElementById('vitalSigns').textContent,
                    physicalExam: document.getElementById('physicalExam').textContent,
                    diagnosticResults: document.getElementById('diagnosticResults').textContent
                },
                assessment: {
                    primaryDiagnosis: document.getElementById('primaryDiagnosis').textContent,
                    differentialDx: document.getElementById('differentialDx').textContent,
                    clinicalImpression: document.getElementById('clinicalImpression').textContent
                },
                plan: {
                    medications: document.getElementById('medications').textContent,
                    procedures: document.getElementById('procedures').textContent,
                    followUp: document.getElementById('followUp').textContent,
                    patientEducation: document.getElementById('patientEducation').textContent
                }
            },
            originalTranscript: this.transcript
        };
    }
    
    clearSOAPNote() {
        if (confirm('Clear the current SOAP note? This action cannot be undone.')) {
            const fields = ['patientName', 'patientDOB', 'patientMRN',
                          'chiefComplaint', 'presentIllness', 'reviewSystems', 'pastMedicalHistory',
                          'vitalSigns', 'physicalExam', 'diagnosticResults',
                          'primaryDiagnosis', 'differentialDx', 'clinicalImpression',
                          'medications', 'procedures', 'followUp', 'patientEducation'];
            
            fields.forEach(id => {
                const field = document.getElementById(id);
                if (field) {
                    if (id === 'patientName') field.textContent = 'Patient Name';
                    else if (id === 'patientDOB') field.textContent = 'MM/DD/YYYY';
                    else if (id === 'patientMRN') field.textContent = 'MRN';
                    else field.textContent = `${id.replace(/([A-Z])/g, ' $1').toLowerCase()} will appear here...`;
                    
                    field.style.borderStyle = 'dashed';
                    field.style.borderColor = '#d1d5db';
                }
            });
            
            // Reset word counts
            fields.forEach(fieldId => this.updateWordCount(fieldId));
            
            this.soapData = this.initializeSoapData();
            this.updateSOAPProgress();
            this.showNotification('success', 'SOAP Note Cleared', 'Ready for new conversation');
        }
    }
    
    onSpecialtyChange() {
        const specialty = document.getElementById('medicalSpecialty').value;
        const displayName = specialty.charAt(0).toUpperCase() + specialty.slice(1);
        document.getElementById('soapSpecialty').textContent = displayName;
    }
    
    loadSpecialtyTemplates() {
        this.onSpecialtyChange();
    }
    
    updateSessionInfo() {
        document.getElementById('sessionDate').textContent = 
            this.sessionStartTime.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        
        document.getElementById('sessionId').textContent = this.sessionId;
        document.getElementById('footerSessionId').textContent = this.sessionId;
        document.getElementById('soapNoteDate').textContent = 
            this.sessionStartTime.toLocaleDateString('en-US');
    }
    
    updateMessageCount() {
        const count = this.transcript.length;
        document.getElementById('messageCount').textContent = 
            `${count} exchange${count !== 1 ? 's' : ''}`;
    }
    
    startDurationTimer() {
        this.durationTimer = setInterval(() => {
            const duration = this.calculateSessionDuration();
            document.getElementById('sessionDuration').textContent = this.formatDuration(duration);
            document.getElementById('currentSessionTime').textContent = this.formatDuration(duration);
        }, 1000);
    }
    
    calculateSessionDuration() {
        return Math.floor((new Date() - this.sessionStartTime) / 1000);
    }
    
    formatDuration(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    handleRecognitionError(event) {
        console.error('Speech recognition error:', event.error);
        let message = 'Speech recognition error occurred';
        
        switch (event.error) {
            case 'no-speech':
                message = 'No speech detected, still listening...';
                return; // Don't show notification for this
            case 'audio-capture':
                message = 'Microphone not accessible';
                break;
            case 'not-allowed':
                message = 'Microphone permission denied';
                break;
            case 'network':
                message = 'Network error occurred';
                break;
            default:
                message = `Recognition error: ${event.error}`;
        }
        
        this.showNotification('error', 'Recognition Error', message);
    }
    
    showNotification(type, title, message) {
        const notification = document.getElementById('notification');
        const icon = document.getElementById('notificationIcon');
        const titleEl = document.getElementById('notificationTitle');
        const messageEl = document.getElementById('notificationMessage');
        
        const icons = {
            success: '<i class="fas fa-check-circle text-green-500 text-xl"></i>',
            error: '<i class="fas fa-exclamation-circle text-red-500 text-xl"></i>',
            warning: '<i class="fas fa-exclamation-triangle text-yellow-500 text-xl"></i>',
            info: '<i class="fas fa-info-circle text-blue-500 text-xl"></i>'
        };
        
        icon.innerHTML = icons[type] || icons.info;
        titleEl.textContent = title;
        messageEl.textContent = message;
        
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, MedScriptConfig.ui.notificationDuration);
    }
    
    downloadFile(content, mimeType, filename) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Global functions for inline event handlers
function autoSave() {
    if (window.soapGenerator) {
        window.soapGenerator.autoSave();
    }
}

function getSuggestions(section) {
    if (window.soapGenerator) {
        window.soapGenerator.generateAISuggestions();
    }
}

function searchICD(element, dropdownId) {
    const query = element.textContent.toLowerCase();
    const dropdown = document.getElementById(dropdownId);
    
    if (query.length < 2) {
        dropdown.classList.add('hidden');
        return;
    }

    const matches = TemplateUtils.searchICDCodes(query, 5);

    if (matches.length > 0) {
        dropdown.innerHTML = matches.map(code => 
            `<div class="icd-item" onclick="selectICD('${element.id}', '${code.code}', '${code.description}', '${dropdownId}')">
                <strong>${code.code}</strong> - ${code.description}
            </div>`
        ).join('');
        dropdown.classList.remove('hidden');
    } else {
        dropdown.classList.add('hidden');
    }
}

function selectICD(elementId, code, description, dropdownId) {
    const element = document.getElementById(elementId);
    const dropdown = document.getElementById(dropdownId);
    
    element.textContent = `${code} - ${description}`;
    dropdown.classList.add('hidden');
    
    if (window.soapGenerator) {
        window.soapGenerator.updateWordCount(elementId);
        window.soapGenerator.autoSave();
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.soapGenerator = new EnhancedSOAPNoteGenerator();
    
    // Check if API keys are configured
    if (!areAPIKeysConfigured()) {
        console.warn('API keys not configured. The application will use mock responses.');
        if (MedScriptConfig.debug.enabled) {
            console.log('To configure API keys, edit js/config.js and replace the placeholder values.');
        }
    }
    
    // Development helpers
    if (MedScriptConfig.debug.enabled) {
        window.config = MedScriptConfig;
        window.templates = MedScriptTemplates;
        window.utils = TemplateUtils;
        console.log('MedScript Pro initialized in debug mode');
        console.log('Available debug objects: config, templates, utils, soapGenerator');
    }
});