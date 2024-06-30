import React from 'react';
import type { Token } from './types';
import { useConnex, useWallet } from '@vechain/dapp-kit-react';
import { unitsUtils } from '@vechain/sdk-core';
import type { AccountDetail } from '@vechain/sdk-network';

type Props = {
    token?: Token
    onClick?: (balance: string) => void
}

export default function Balance({ token, onClick }: Props) {
    const contractAddr = "0x219d0dbc57c191ce0bec0178eb5b18a77f3fc79e";
    const { account } = useWallet()
    const connex = useConnex()

    const [balance, setBalance] = React.useState("0")

    const onClaim = async () => {

        const clause = {
            value: 0,
            data: "0x",
            to: contractAddr,
            abi: JSON.stringify( {
                "type": "function",
                "name": "claim",
                "inputs": [],
                "outputs": [],
                "stateMutability": "nonpayable"
              })
        }

        try {
            const result = await connex.vendor.sign("tx", [clause]).signer(account).request();
            console.log(result);
        } catch (error) {
            console.error(error);
        }
        
    }

    React.useEffect(() => {

        //onClaim();

        //connex.vendor.sign()

        // connex.vendor.account("0x219d0dbc57c191ce0bec0178eb5b18a77f3fc79e")
        // .method(
        //     {
        //         "type": "function",
        //         "name": "claim",
        //         "inputs": [],
        //         "outputs": [],
        //         "stateMutability": "nonpayable"
        //       })
        // .call()
        // .then(() => {
        //     //setBalance(unitsUtils.formatUnits(balance, token.decimals))
        // })
        // .catch((error: Error) => {
        //     console.error(error)
        // })
    

        if (!token) {
            connex.thor.account(account).get()
                .then(({ balance }: AccountDetail) => {
                    setBalance(unitsUtils.formatVET(balance))
                })
                .catch((error: Error) => {
                    console.error(error)
                })
        }
        else {
            connex.thor.account(token.address)
                .method(
                    {
                        "inputs": [{ "name": "owner", "type": "address" }],
                        "name": "balanceOf",
                        "outputs": [{ "name": "balance", "type": "uint256" }]
                    })
                .call(account)
                .then(({ decoded: { balance } }: { decoded: { balance: string } }) => {
                    setBalance(unitsUtils.formatUnits(balance, token.decimals))
                })
                .catch((error: Error) => {
                    console.error(error)
                })
        }
    }, [account, token])

    if (!account) { return null }

    const handleClick = () => onClick && onClick(balance)
    return (
        <span onClick={handleClick}>
            Balance: {balance}
        </span>
    )

}