import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { BankrunProvider, startAnchor } from 'anchor-bankrun'
import { Keypair, PublicKey } from '@solana/web3.js'
import { Counter } from '../target/types/crud'
import { Ban } from 'lucide-react'
import { Journal } from 'anchor/target/types/journal'
import { experimental_useEffectEvent } from 'react'

const IDL = require('../target/idl/journal.json');
const programId = new PublicKey('FqzkXZdwYjurnUKetJCAvaUw5WAqbwzU6gZEwydeEfqS')

describe('crud', () => {
  // user anchor-bankrun to run the tests
  


  it('create Journal',  async () => {
    
    const context = await startAnchor("", [{
    name: 'crud',
    programId: programId,
    }], []) 
    
    const provider = new BankrunProvider(context);

    const program = new Program<Journal>(IDL, provider);

    const [journalAddress] = PublicKey.findProgramAddressSync(
      [Buffer.from('My First Journal'), 
        // owner public key
        provider.wallet.publicKey.toBuffer()
      ],
      program.programId
    );

    await program.methods.create(
      'My First Journal',
      'This is my first journal entry!'
    ).rpc();

    const journalEntry = await program.account.journalEntryState.fetch(journalAddress);

    expect(journalEntry.title).toBe('My First Journal');
    expect(journalEntry.message).toBe('This is my first journal entry!');
  })

 
})
