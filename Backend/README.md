# PushNode Backend-App

PushNode Backend

## Getting Started

### 1. Fork it :fork_and_knife:

Fork the [project repository](https://github.com/ProtoDrive/PushNote) on GitHub by clicking the "Fork" button in the top-right corner.

### 2. Clone it :busts_in_silhouette:

Clone the forked repository to your local machine using the following command:

```bash
git clone https://github.com/{your-name}/PushNote
```

### 3. Set it up :arrow_up:

Navigate to the project directory:

```bash
cd PushNote/Backend
```

### 4. Run it :checkered_flag:

Install the required dependencies using npm:

```bash
npm install
```

### 5. For testing purpose 💥

Copy the following content from `.env.sample` file and create a `.env` file in the project root directory of Backend folder. Fill the all key values.<br/>
For twilio values login to [twilio](https://www.twilio.com/login)

```env
MONGO_URI=<your_mongodb_url>
ACCOUNT_SID=<your_twilio_accound_sid>
AUTH_TOKEN=<your_twilio_accound_sid>
SMS_SECRET_KEY=<your_sms_secret_key>
TWILIO_PHONE_NUMBER=<your_twilio_accound_phoneNo>
```

### 6. Launch the Application 🚀

Start the development server:

```bash
npm run dev
```

Server running at http://localhost:3001
