# Azure Avatar Demo

Welcome to the Azure Avatar Demo! This project showcases the integration of Azure AI's Text-to-Speech Avatar feature into a ReactJS application. With this application, you can bring lifelike synthetic talking avatars to your projects.

[Watch the Demo Video](./demovideo/AvatarAzureMediumDemo.mp4)

Click the link above to watch a demo of the Azure Avatar in action!


## NOTICE

Microsoft is now retiring azure TURN services. Azure TTS avatar was using azure turn services for communication.
I have added script to install coturn on ubuntu instance. Execute installCoturn.sh to setup your own TURN server.

Refer this medium link -> 

https://raokarthik83.medium.com/azure-avatar-tts-update-migrating-from-azure-turn-to-coturn-14b6ac86d60c



## Getting Started

Follow these steps to set up and run the application locally:

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/hacktronaut/azure-avatar-demo.git
   cd azure-avatar-demo

2. **Install Dependencies:**
    ```bash
    npm install
    ```
3. **Start the Application:**
    ```bash
    npm start
    ```

The application will be accessible at http://localhost:3000 in your web browser.

### Configuration

Make sure to configure the necessary API keys and settings in the config.js file before running the application.

```javascript
// config.js
export const avatarAppConfig = {
  cogSvcRegion: 'your-region',
  cogSvcSubKey: 'your-subscription-key',
  // ... (other configuration options)
};
```

### Feedback and Issues

If you encounter any issues or have feedback, please open an issue. We welcome your contributions and suggestions!

Happy coding!