// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
}

contract EscrowTest {
    struct Transaction {
        uint256 amount;
        address token;
        address buyer;
        address seller;
        address intermediary;
        uint8 state; // 0: FUNDED, 1: RELEASED, 2: REFUNDED
    }

    mapping(uint256 => Transaction) public transactions;

    function deposit(uint256 amount, address token, uint256 transactionId, address seller, address intermediary) external {
        require(transactions[transactionId].amount == 0, "Transaction already exists");
        // Removed for UI demo mock: require(IERC20(token).transferFrom(msg.sender, address(this), amount), "Transfer failed");

        transactions[transactionId] = Transaction({
            amount: amount,
            token: token,
            buyer: msg.sender,
            seller: seller,
            intermediary: intermediary,
            state: 0
        });
    }

    function release(uint256 transactionId) external {
        Transaction storage txn = transactions[transactionId];
        require(txn.state == 0, "Invalid state");
        // Removed for UI demo mock: require(msg.sender == txn.intermediary, "Only intermediary can release");

        txn.state = 1;
        // Removed for UI demo mock: require(IERC20(txn.token).transfer(txn.seller, txn.amount), "Transfer failed");
    }

    function refund(uint256 transactionId) external {
        Transaction storage txn = transactions[transactionId];
        require(txn.state == 0, "Invalid state");
        // Removed for UI demo mock: require(msg.sender == txn.intermediary, "Only intermediary can refund");

        txn.state = 2;
        // Removed for UI demo mock: require(IERC20(txn.token).transfer(txn.buyer, txn.amount), "Transfer failed");
    }
}
