# 🌟 Soroswap Frontend🌟

Welcome to Soroswap, a decentralized exchange (DEX) that draws inspiration from the Uniswap V2 protocol and is specifically tailored for the Soroban network.

Before you begin, ensure you have met the following requirements:

- docker >= v24.0.2
- **Freighter Wallet** You can have an intependent environment following the instructios in [this post](https://discord.com/channels/897514728459468821/1135655444157833256/1135655444157833256)

## 🛠 Setting Up Soroswap 🛠

### 1. Clone the Repository

    ```bash
    git clone https://github.com/soroswap/frontend.git
    cd frontend
    ```

### 2.Set Up Environment Variables

Copy the .env.example file to create a new .env file:

```bash
cp .env.local.example .env
```
Edit the `.env` file. Check the `.env.local.example` file for explanations
```md

The `NEXT_PUBLIC_TEST_TOKENS_ADMIN_SECRET_KEY` should be the same as the one that deployed the tokens in the `core` repository.
This is only important if you will be minting testnet tokens, otherwise is not interesting.

To enable or disable features like the `Soroswap backend` or the `aggregator`, switch the  `NEXT_PUBLIC_AGGREGATOR_ENABLED` variables to `true` or `false`.

1. Start Docker

    Navigate to the the `run.sh` script inside the `docker` folder

    ```bash
    bash docker/run.sh
    ```
    If the soroswap-network does not exisit, please create: `docker network create soroswap-network`

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
    http://localhost:3000
    

6. For Tesntet Development, check your Freigher Wallet Configuration if you are running your one node
    THis is not necesary if you are using Mainnet or Testnet.

    For Standalone network
    | | |
    |---|---|
    | Name | Local Standalone |
    | HORIZON RPC URL | http://localhost:8000 |
    | SOROBAN RPC URL | http://localhost:8000/soroban/rpc |
    | Passphrase | Standalone Network ; February 2017 |
    | Friendbot | http://localhost:8000/friendbot |
    | Allow HTTP connection | Enabled |
    | Switch to this network | Enabled |

    For Futurenet network
    | | |
    |---|---|
    | Name | Local Futurenet|
    | HORIZON RPC URL | http://localhost:8000 |
    | SOROBAN RPC URL | http://localhost:8000/soroban/rpc |
    | Passphrase | Test SDF Future Network ; October 2022 |
    | Friendbot | http://localhost:8000/friendbot |
    | Allow HTTP connection | Enabled |
    | Switch to this network | Enabled |

    ** Important:** You should also do: Preferences> Allow experimental mode

7. Last, but not least, add some lumens to your Freighter wallet!

   Do it directly on the wallet or use:

   For Standalone: `http://localhost:8000/friendbot?addr=<your address>`
   For Futurenet, visit: https://laboratory.stellar.org/#create-account

🚀 Congrats! 🚀

You have successfully set up Soroswap on your local machine! Start swapping, pooling, and exploring the possibilities of decentralized finance (DeFi) on the Soroban network.

If you want to add or remove supported protocols, you can do so by editing the `functions/generateRoute.ts:79-97` file and adding or removing the protocols you want to support on swap.

> [!HINT]
> You can found the list of supported protocols in the `soroswap-router-sdk` repository.

## 🧪🔨 Testing 🧪🔨
To execute the tests, you must first start the development container. To do this, run the following command from your host machine:

```bash
bash docker/run.sh
```
Once the development container is running, you can install the dependencies for the tests by running the following command:

```bash
yarn install
```

Finally, to run the tests, run the following command from within the development container:

```bash
yarn test
```
This will run all of the unit and integration tests for the project.

The tests are written using Vitest & testing-library.

For more information on Vitest, please see the Vitest documentation: https://vitest.dev/. 

For more information on Testing Library, please see the Testing Library documentation: https://testing-library.com/docs/react-testing-library/intro/

## Contributing

If you find a bug or have a feature request, please create an issue or submit a pull request. Contributions are always welcome!

License: MIT

## Acknowledgments

Special thanks to the Uniswap team for providing the base protocol on which Soroswap is built.
Thank you to the Stellar Community for the continuous support.

---

---

Made with ❤️ by the Soroswap Team.
