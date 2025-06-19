import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { BankrunProvider, startAnchor } from 'anchor-bankrun'
import { Keypair, PublicKey } from '@solana/web3.js'
import { Counter } from '../target/types/crud'
import { Ban } from 'lucide-react'
import { Journal } from 'anchor/target/types/journal'
import { experimental_useEffectEvent } from 'react'
import { it } from 'node:test'

const IDL = require('../target/idl/journal.json');
const programId = new PublicKey('AswGaza27fujkgUVZr7WEa7548qRegZXEG2w6eKH38ri')

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
  });

  it('update Journal', async () => {
    const context = await startAnchor("", [{
      name: 'crud',
      programId: programId,
    }], []) 
    
    const provider = new BankrunProvider(context);

    const program = new Program<Journal>(IDL, provider);

    await program.methods.create(
      'My First Journal',
      'This is my first journal entry!'
    ).rpc();

    const [journalAddress] = PublicKey.findProgramAddressSync(
      [Buffer.from('My First Journal'), 
        // owner public key
        provider.wallet.publicKey.toBuffer()
      ],
      program.programId
    );

    await program.methods.update(
      'My First Journal',
      'This is my updated journal entry!'
    ).rpc();

    const journalEntry = await program.account.journalEntryState.fetch(journalAddress);

    expect(journalEntry.title).toBe('My First Journal');
    expect(journalEntry.message).toBe('This is my updated journal entry!');
  }
  )
  it('delete Journal', async () => {
    const context = await startAnchor("", [{
      name: 'crud',
      programId: programId,
    }], []) 
    
    const provider = new BankrunProvider(context);

    const program = new Program<Journal>(IDL, provider);

    await program.methods.create(
      'My First Journal',
      'This is my first journal entry!'
    ).rpc();

    const [journalAddress] = PublicKey.findProgramAddressSync(
      [Buffer.from('My First Journal'), 
        // owner public key
        provider.wallet.publicKey.toBuffer()
      ],
      program.programId
    );

    await program.methods.delete(
      'My First Journal'
    ).rpc();

    // Check if the account is closed
    try {
      await program.account.journalEntryState.fetch(journalAddress);
      throw new Error('Journal entry should be closed');
    } catch (error) {
      expect(error.message).toContain("Could not find "+ journalAddress.toBase58());
    }
  }
  )

 
})
