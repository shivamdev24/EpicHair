
# EpicHair - Professional Haircare and Grooming Services

EpicHair is a web application designed to streamline the process of booking appointments, managing staff, and providing a seamless salon experience for both customers and administrators. The platform offers features for users, staff, and administrators to manage appointments, services, and profiles efficiently.

---


## Features

### For Customers
- Browse available services and stylists.
- Book appointments with preferred stylists.
- View and manage appointment history.
- Provide feedback and ratings for completed appointments.

### For Staff
- View assigned appointments.
- Update appointment statuses (e.g., pending, confirmed, completed).
- Manage working hours and availability.

### For Administrators
- Manage users, staff, and services.
- View all appointments and their statuses.
- Add or update services and staff details.
- Generate reports for business insights.

---

## Technologies Used

- **Frontend**: React, Next.js, TailwindCSS  
- **Backend**: Node.js, Express.js  
- **Database**: MongoDB  
- **Authentication**: JSON Web Tokens (JWT)  
- **Styling**: TailwindCSS  
- **Image Uploads**: Cloudinary  
- **SMS Notifications**: Twilio  

---



````
````
## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/EpicHair.git
   cd EpicHair
    ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.sample .env
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Visit the app in your browser**

   ```
   http://localhost:3000
   ```


## Environment Variables

Make sure to set the following in your `.env` file:

```
MONGO_URI=<Your MongoDB connection string>
TOKEN_SECRET=<Your JWT secret>
CLOUDINARY_URL=<Your Cloudinary API URL>
TWILIO_ACCOUNT_SID=<Your Twilio SID>
TWILIO_AUTH_TOKEN=<Your Twilio Auth Token>
TWILIO_PHONE_NUMBER=<Your Twilio Phone Number>
```
````





