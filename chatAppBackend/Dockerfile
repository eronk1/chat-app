# Using a lighter version of Node
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY ./package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your app's source code from your host to your image filesystem.
COPY . .

# Copy environment variables
COPY .env .

# Expose the port the app runs on
EXPOSE 3000

# Command to run when starting the container
CMD ["npm", "start"]
