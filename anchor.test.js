describe("Test", () => {
    it("initialize", async () => {
      const newAccountKp = new web3.Keypair();
      const data = new BN(42);
      const txHash = await pg.program.methods
        .initialize(data)
        .accounts({
          newAccount: newAccountKp.publicKey,
          signer: pg.wallet.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .signers([newAccountKp])
        .rpc();
      console.log(`Use 'solana confirm -v ${txHash}' to see the logs`);
      await pg.connection.confirmTransaction(txHash);
  
      const newAccount = await pg.program.account.newAccount.fetch(
        newAccountKp.publicKey
      );
      console.log("On-chain data is:", newAccount.data.toString());
      assert(data.eq(newAccount.data));
    });
  
    it("Add Candidate", async () => {
      const newAccountKp = new web3.Keypair();
      const provider = anchor.AnchorProvider.env();
      const nickname = "";
      const instructionData = Buffer.concat([
        Buffer.from([0]),
        Buffer.from(nickname, "utf-8"),
      ]);
      const transaction = new anchor.web3.Transaction();
      transaction.add(
        anchor.web3.SystemProgram.transfer({
          fromPubkey: newAccountKp.publicKey,
          toPubkey: anchor.web3.SystemProgram.programId,
          lamports: 100000,
        })
      );
      transaction.add(
        new anchor.web3.TransactionInstruction({
          keys: [
            { pubkey: newAccountKp.publicKey, isSigner: true, isWritable: true },
          ],
          programId: new anchor.web3.PublicKey(web3.SystemProgram.programId),
          data: instructionData,
        })
      );
      await provider.sendAndConfirm(transaction, [newAccountKp]);
      const candidate = await pg.program.account.candidate.fetch(
        newAccountKp.publicKey
      );
      console.log("On-chain data is:", candidate);
      assert.equal(candidate.nickname, nickname);
      assert.equal(candidate.voteCount, 0);
    });
  
    it("voting a candidate", async () => {
      let candidateName = "";
      const candidateAccount = new web3.Keypair();
      const txHash = await pg.program.methods
        .addCandidate(candidateName)
        .accounts({
          candidate: candidateAccount.publicKey,
          signer: pg.wallet.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .signers([candidateAccount])
        .rpc();
      console.log(`Use 'solana confirm -v ${txHash}' to see the logs`);
      await pg.connection.confirmTransaction(txHash);
  
      await pg.program.methods
        .vote()
        .accounts({
          candidate: candidateAccount.publicKey,
          signer: pg.wallet.publicKey,
          systemProgram: web3.SystemProgram.programId,
          rent: web3.SYSVAR_RENT_PUBKEY,
        })
        .rpc();
  
      const candidate = await pg.program.account.candidate.fetch(
        candidateAccount.publicKey
      );
      console.log("Vote count is:", candidate.voteCount.toString());
      assert.equal(candidate.voteCount, 1);
    });
  
    it("view vote a candidate", async () => {
      const candidateAccount = new web3.Keypair();
      const candidateName = "";
      const txHash = await pg.program.methods
        .addCandidate(candidateName)
        .accounts({
          candidate: candidateAccount.publicKey,
          signer: pg.wallet.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .signers([candidateAccount])
        .rpc();
  
      await pg.connection.confirmTransaction(txHash);
  
      const result = await pg.program.methods
        .viewVote()
        .accounts({
          voter: pg.wallet.publicKey,
          candidate: candidateAccount.publicKey,
        })
        .rpc();
  
      console.log(result);
    });
  });
  