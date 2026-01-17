# SecureVault - Password Manager

A secure, privacy-first password manager built with Next.js, featuring client-side encryption and a powerful password generator.

<p align="center">
   <img
      src="https://github.com/user-attachments/assets/7c9d1dac-b047-41e2-a96c-0969b880a0a6",
      height=550px,
      width=500px>
</p>


## Features

### Core Functionality
- **Secure Password Generator**: Generate strong passwords with customizable options
- **Encrypted Vault**: Store passwords with client-side AES encryption
- **User Authentication**: Secure login system with bcrypt password hashing
- **CRUD Operations**: Full create, read, update, delete functionality for vault items
- **Search & Filter**: Find vault items quickly with real-time search

### Security Features
- **Client-side Encryption**: All sensitive data is encrypted before being sent to the server
- **No Plaintext Storage**: Passwords are never stored in plaintext
- **Secure Random Generation**: Cryptographically secure password generation
- **Auto-clear Clipboard**: Copied passwords are automatically cleared after 15 seconds
- **Session Management**: Secure JWT-based authentication with NextAuth.js

### User Experience
- **Dark Theme**: Modern, easy-on-the-eyes interface
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Real-time Feedback**: Immediate success/error notifications
- **Intuitive Navigation**: Clean, organized interface

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: NextAuth.js with JWT
- **Styling**: Tailwind CSS
- **Encryption**: AES-256-CBC (client-side)
- **Password Hashing**: bcrypt

## Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- MongoDB database (local or Atlas)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd password-vault-nextjs
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.template .env.local
   ```

   Edit `.env.local` and configure:
   - `MONGODB_URI`: Your MongoDB connection string
   - `NEXTAUTH_SECRET`: A secure random string for JWT signing
   - `NEXTAUTH_URL`: Your application URL (http://localhost:3000 for development)
   - `NEXT_PUBLIC_ENCRYPTION_SECRET`: A 32+ character encryption key

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

## Project Structure

```
password-vault-nextjs/
├── lib/                 # Utility libraries
│   └── mongodb.ts       # Database connection
├── models/              # MongoDB models
│   ├── User.ts          # User model
│   └── VaultItem.ts     # Vault item model
├── pages/               # Next.js pages
│   ├── api/             # API routes
│   │   ├── auth/        # Authentication endpoints
│   │   ├── users/       # User management
│   │   └── vault/       # Vault operations
│   ├── _app.tsx         # App wrapper
│   ├── index.tsx        # Landing/login page
│   └── dashboard.tsx    # Main application
├── styles/              # Global styles
├── types/               # TypeScript definitions
├── utils/               # Utility functions
│   ├── encryption.ts    # Client-side encryption
│   └── passwordGenerator.ts  # Password generation
└── ...config files
```

## API Endpoints

- `POST /api/users/register` - User registration
- `POST /api/auth/[...nextauth]` - Authentication (NextAuth)
- `GET /api/vault/items` - Get user's vault items
- `POST /api/vault/items` - Create new vault item
- `PUT /api/vault/items` - Update vault item
- `DELETE /api/vault/items` - Delete vault item

## Security Considerations

- All passwords are encrypted client-side before transmission
- Server never has access to plaintext passwords
- User authentication passwords are hashed with bcrypt
- JWT tokens are signed with a secure secret
- HTTPS should be used in production
- Environment variables contain sensitive configuration

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with Next.js and React
- Security powered by client-side encryption
- UI styled with Tailwind CSS
- Database operations with MongoDB and Mongoose
