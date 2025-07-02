# MedScript Pro - Enhanced SOAP Note Generator

A professional, AI-powered SOAP note generator designed for healthcare professionals. Features voice recognition, real-time transcription, and intelligent medical documentation with multiple AI provider support.

## 🚀 Features

### Core Functionality
- **Voice Recognition**: Real-time speech-to-text with speaker identification
- **AI-Powered SOAP Generation**: Intelligent medical documentation using OpenAI GPT-4 and Anthropic Claude
- **Multiple Medical Specialties**: Templates for General Medicine, Cardiology, Pediatrics, Psychiatry, and more
- **Real-time Transcription**: Live conversation transcription with confidence indicators
- **Auto-save**: Automatic session saving every 30 seconds

### Enhanced Features
- **Quick Templates**: Pre-built SOAP note templates for common scenarios
- **ICD-10 Code Lookup**: Smart search and autocomplete for diagnostic codes
- **AI Suggestions**: Contextual suggestions for improving SOAP note quality
- **Voice Commands**: Hands-free control ("switch to patient", "generate SOAP", etc.)
- **Word Count Tracking**: Real-time word counts for all SOAP sections
- **SOAP Validation**: Quality checks to ensure completeness
- **Export Options**: JSON and text export with metadata

### Professional Features
- **Session Management**: Track session duration, exchange counts, and timestamps
- **Print Optimization**: Clean, professional printing layout
- **Mobile Responsive**: Works on tablets and mobile devices
- **Clinical Grade Security**: No data stored externally, all processing local

## 📁 Project Structure

```
medscript-pro/
├── index.html              # Main HTML file
├── README.md               # Project documentation
├── css/
│   └── styles.css          # All styles in one file
├── js/
│   ├── app.js              # Main application logic
│   ├── config.js           # Configuration (AI keys, settings)
│   └── templates.js        # SOAP templates and data
└── assets/
    └── favicon.ico         # App icon
```

## 🛠️ Setup Instructions

### 1. Download/Clone the Project
```bash
git clone [repository-url]
cd medscript-pro
```

### 2. Configure API Keys
Edit `js/config.js` and replace the placeholder API keys:

```javascript
ai: {
    primary: {
        provider: 'openai',
        apiKey: 'your-actual-openai-api-key-here', // Replace this
        model: 'gpt-4'
    },
    fallback: {
        provider: 'anthropic',
        apiKey: 'your-actual-anthropic-api-key-here', // Replace this
        model: 'claude-3-sonnet-20240229'
    }
}
```

### 3. Deploy
- **Local Development**: Open `index.html` in a modern web browser
- **Web Server**: Upload all files to your web server
- **GitHub Pages**: Push to GitHub and enable Pages in repository settings

### 4. Browser Requirements
- Chrome, Firefox, Safari, or Edge (latest versions)
- Microphone access required for voice recognition
- Internet connection required for AI processing

## 🔧 Configuration Options

### AI Providers
The system supports multiple AI providers with automatic fallback:
- **Primary**: OpenAI GPT-4 (recommended)
- **Fallback**: Anthropic Claude Sonnet
- **Demo Mode**: Mock responses when API keys not configured

### Voice Recognition Settings
```javascript
speech: {
    language: 'en-US',
    continuous: true,
    interimResults: true,
    maxAlternatives: 3,
    confidenceThreshold: 0.7
}
```

### Quality Levels
- **Fast**: Basic SOAP note generation
- **Standard**: Comprehensive clinical detail (recommended)
- **High**: Detailed analysis with extensive reasoning

## 📋 Usage Guide

### Basic Workflow
1. **Select Medical Specialty**: Choose from dropdown menu
2. **Start Recording**: Click Clinician or Patient to begin voice recording
3. **Conduct Interview**: Record patient-provider conversation
4. **Generate SOAP**: Click "Generate SOAP Note" for AI analysis
5. **Review & Edit**: Make any necessary edits to the generated note
6. **Export/Print**: Save or print the final SOAP note

### Voice Commands
- "Switch to patient" - Change speaker to patient
- "Switch to clinician" - Change speaker to clinician
- "New paragraph" - Add paragraph break
- "Generate SOAP" - Start SOAP note generation
- "Pause recording" - Pause the recording
- "Stop recording" - Stop the recording

### Templates
Use quick templates for common scenarios:
- **Annual Physical**: Routine health maintenance visits
- **Chest Pain Evaluation**: Cardiac assessment protocol
- **Pediatric Well Visit**: Child health examinations
- **Mental Health Assessment**: Psychiatric evaluations

## 🔐 Security & Privacy

### Data Handling
- **No External Storage**: All data processed locally in browser
- **Session-Based**: Data cleared when browser closed
- **API Security**: Encrypted HTTPS communication with AI providers
- **No Tracking**: No analytics or user tracking implemented

### HIPAA Considerations
- Configure on private/secure networks
- Use organization-approved AI services
- Implement additional access controls as needed
- Regular security audits recommended

## 🚀 Advanced Features

### Auto-Save System
- Automatic saving every 30 seconds
- Visual indicators for save status
- Session recovery on page reload

### ICD-10 Integration
- Real-time code search
- Common codes database included
- Automatic code suggestions

### AI Suggestions
- Context-aware recommendations
- Specialty-specific guidance
- Quality improvement tips

## 🔧 Development

### Debug Mode
Enable debug mode in `js/config.js`:
```javascript
debug: {
    enabled: true,
    logLevel: 'debug',
    mockAI: true,
    showTimings: true
}
```

### Extending Functionality
- **Add Templates**: Edit `js/templates.js`
- **New Specialties**: Add to `MedScriptConfig.specialties`
- **Custom Voice Commands**: Modify `MedScriptConfig.voiceCommands`
- **UI Customization**: Edit `css/styles.css`

## 📊 Browser Compatibility

| Browser | Voice Recognition | AI Processing | Export |
|---------|------------------|---------------|---------|
| Chrome  | ✅ Full Support   | ✅ Yes        | ✅ Yes  |
| Firefox | ⚠️ Limited       | ✅ Yes        | ✅ Yes  |
| Safari  | ✅ Full Support   | ✅ Yes        | ✅ Yes  |
| Edge    | ✅ Full Support   | ✅ Yes        | ✅ Yes  |

## 🐛 Troubleshooting

### Common Issues

**Microphone Not Working**
- Check browser permissions
- Ensure HTTPS connection
- Try different browser

**AI Generation Fails**
- Verify API keys in `js/config.js`
- Check internet connection
- Try fallback provider

**Voice Recognition Inaccurate**
- Speak clearly and slowly
- Use external microphone
- Check browser compatibility

**Export Not Working**
- Disable popup blockers
- Try different browser
- Check file permissions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For technical support or feature requests:
- Create an issue in the repository
- Check the troubleshooting section
- Review browser compatibility

## 📈 Version History

### v2.0.0 (Current)
- Complete redesign with modular architecture
- Multiple AI provider support
- Enhanced voice recognition
- Professional templates
- Auto-save functionality

### v1.0.0
- Initial release
- Basic SOAP note generation
- Simple voice recognition

---

**Note**: This application is designed for healthcare professionals. Ensure compliance with your organization's policies and applicable regulations before use in clinical settings.