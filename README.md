# To get started

## 0. Make sure you have the right version of `solana`.

If you check `spl-token` version it should be `3.4.0`

```bash
spl-token --version
```

If not try to update it using `solana-install`

<!-- TODO: find the command that will install the exact version of 3.4.0 instead of the latest version. -->

```bash
solana-install update
solana-install gc
```

After that check the version again.

```bash
spl-token --version
```

it should be `3.4.0` or higher

## 1. Start a local validator with `token22` program on in

1. Clone the (solana program library repo)[https://github.com/solana-labs/solana-program-library/tree/master]
2. Get inside `/token/program-2022` folder
3. Run `cargo build-sbf` to build the program
4. Go back to the root directory of the repo
5. Start a local validator with the program

```bash
solana-test-validator --bpf-program TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb target/deploy/spl_token_2022.so
```

Now you are good to go and build, but make sure that you choose the local validator when you initiate your connection object

