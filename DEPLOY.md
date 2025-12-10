# Auto Deploy Configuration

This repository is configured with automatic deployment to your server when code is pushed to the `main` branch.

## How It Works

When you push code to the `main` branch, a GitHub Actions workflow automatically:
1. Connects to your server via SSH
2. Runs `git pull` to get the latest code
3. Restarts Docker containers using `docker-compose`

## Setup Instructions

To enable auto-deployment, you need to configure the following GitHub Secrets:

### Required Secrets

Go to your repository Settings → Secrets and variables → Actions → New repository secret, and add:

1. **SERVER_HOST**
   - The IP address or domain of your server
   - Example: `192.168.1.100` or `example.com`

2. **SERVER_USER**
   - The SSH username for your server
   - Example: `ubuntu` or `root`

3. **SSH_PRIVATE_KEY**
   - Your SSH private key for authentication
   - Generate if you don't have one:
     ```bash
     ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
     ```
   - Copy the **private key** content:
     ```bash
     cat ~/.ssh/id_rsa
     ```
   - Add the **public key** to your server:
     ```bash
     ssh-copy-id user@your-server
     # or manually add to ~/.ssh/authorized_keys on server
     ```

4. **PROJECT_PATH**
   - The absolute path to your project on the server
   - Example: `/home/ubuntu/learn-workflow` or `/var/www/myapp`

5. **SERVER_PORT** (Optional)
   - SSH port number (default: 22)
   - Only needed if your SSH runs on a different port

### Server Prerequisites

Your server must have:
- Git installed
- Docker and Docker Compose installed
- SSH access enabled
- The repository already cloned at `PROJECT_PATH`
- Proper permissions for the SSH user to run git and docker commands

### First Time Server Setup

On your server, run these commands:

```bash
# Clone the repository
cd /path/to/parent/directory
git clone https://github.com/JelangA/learn-workflow.git
cd learn-workflow

# Make sure your SSH user can run Docker without sudo (if needed)
sudo usermod -aG docker $USER
newgrp docker

# Test docker commands
docker ps
docker-compose --version
```

## Testing the Workflow

1. Make a change to any file in the repository
2. Commit and push to the `main` branch:
   ```bash
   git add .
   git commit -m "Test auto-deployment"
   git push origin main
   ```
3. Go to the "Actions" tab in your GitHub repository
4. Watch the deployment workflow run
5. Check your server to verify the changes were deployed

## Troubleshooting

### SSH Connection Failed
- Verify `SERVER_HOST`, `SERVER_USER`, and `SERVER_PORT` are correct
- Ensure the SSH private key is properly formatted (include BEGIN/END markers)
- Check that the public key is in `~/.ssh/authorized_keys` on the server

### Git Pull Failed
- Ensure the repository is already cloned at `PROJECT_PATH`
- Check that the SSH user has read/write permissions for the project directory
- Verify there are no uncommitted changes on the server that would conflict

### Docker Restart Failed
- Ensure Docker and Docker Compose are installed
- Verify the SSH user has permission to run Docker commands
- Check that `docker-compose.yml` exists in the project root

## Workflow File

The workflow configuration is located at `.github/workflows/deploy.yml`. You can modify it to:
- Change the branch that triggers deployment
- Add additional deployment steps
- Run tests before deploying
- Send notifications

## Security Notes

- Never commit your SSH private key to the repository
- Use GitHub Secrets to store all sensitive information
- Consider using a dedicated deployment user with limited permissions
- Regularly rotate your SSH keys
