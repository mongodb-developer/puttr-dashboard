# Puttr Dashboard

A real-time dashboard application that uses MongoDB Charts with AI-powered analysis and text-to-speech capabilities.

## Features

- Real-time data visualization using MongoDB Charts
- AI-powered chart analysis using AWS Bedrock
- Text-to-speech capabilities using AWS Polly
- Built with Next.js and TypeScript
- Styled with Tailwind CSS

## Prerequisites

- Node.js 18 or later
- AWS account with Polly and Bedrock access
- MongoDB Atlas account with Charts enabled

## Environment Variables

Create a `.env.local` file with the following variables:

```env
AWS_REGION=your_aws_region
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/mongodb-developer/puttr-dashboard.git
cd puttr-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
src/
  ├── app/              # Next.js app router files
  ├── components/       # React components
  ├── utils/           # Utility functions
  └── api/             # API routes
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
