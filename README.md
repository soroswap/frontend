# 🌟 Soroswap 🌟

Welcome to Soroswap, a decentralized exchange (DEX) that is built upon the Uniswap V2 protocol and is specifically tailored for the Soroban network.
Prerequisites

Before you begin, ensure you have met the following requirements:

    You have Docker installed. This repository is tested and confirmed to work with Docker version 24.0.2. Other versions might not be compatible and may cause issues.
    
## 🛠 Setting Up Soroswap 🛠
1. Clone the Repository

```bash

git clone https://github.com/soroswap/frontend.git
cd frontend
```

2. Set Up Environment Variables

Copy the .env.example file to create a new .env file:

```bash
cp .env.example .env
```
Now, edit the `.env` file and fill in the missing information.
Where `PUBLICKEY` and `SECRETKEY` are the token admin keys for minting the tokens deployed on __soroswap/core__

3. Start Docker

Navigate to the docker folder and execute the run.sh script:

```bash
cd docker
bash run.sh
```
This script will set up and start the Docker containers required for Soroswap.
4. Install the Dependencies

After the Docker container is up, you will be inside the root folder on the container. Then, install the dependencies using Yarn:

```bash
yarn install
```

5. Run the Development Instance

Now you are ready to start the development instance. Run the following command:

```bash
yarn dev
```
This will start the Soroswap development instance.
🚀 Congrats! 🚀

You have successfully set up Soroswap on your local machine! Start swapping, pooling, and exploring the possibilities of decentralized finance (DeFi) on the Soroban network.

## Contributing

If you find a bug or have a feature request, please create an issue or submit a pull request. Contributions are always welcome!
License

## Acknowledgments

    Special thanks to the Uniswap team for providing the base protocol on which Soroswap is built.
    Thank you to the Stellar Community for the continuous support.

Made with ❤️ by the Soroswap Team.