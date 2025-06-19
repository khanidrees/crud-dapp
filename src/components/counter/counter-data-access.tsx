'use client'

import { getCounterProgram, getCounterProgramId } from '@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster, PublicKey } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../use-transaction-toast'
import { toast } from 'sonner'

interface createEntryArgs {
  title: string
  message: string
   
}

export function useCounterProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getCounterProgramId(cluster.network as Cluster), [cluster])
  const program = useMemo(() => getCounterProgram(provider, programId), [provider, programId])
  
  const accounts = useQuery({
    queryKey: ['journal', 'all', { cluster }],
    queryFn: () => program.account.journalEntryState.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const createEntry = useMutation<string, Error, createEntryArgs>({
    mutationKey: ['journalEntry', 'create', { cluster }],
    mutationFn: async ({title, message}) => {
      // const [journalEntryAddress] =  PublicKey.findProgramAddressSync(
      //   [Buffer.from(title), owner.toBuffer()],
      //   programId
      // );
      return program.methods.create(title, message).rpc();
    },
      
    onSuccess: async (signature) => {
      transactionToast(signature)
      await accounts.refetch()
    },
    onError: (err) => {
      console.log(err);
      toast.error('Failed to create journal entry');
    },
  })

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    createEntry
  }
}

export function useCounterProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts } = useCounterProgram()
  // const programId = useMemo(() => getCounterProgramId(cluster.network as Cluster), [cluster])

  const accountQuery = useQuery({
    queryKey: ['counter', 'fetch', { cluster, account }],
    queryFn: () => program.account.journalEntryState.fetch(account),
  });

  const updateEntry = useMutation<string, Error, createEntryArgs>({
    mutationKey: ['journalEntry', 'update', { cluster, account }],
    mutationFn:  async ({title, message}) => {
      
      return program.methods.update(title, message).rpc();
    },
    onSuccess: async (tx) => {
      transactionToast(tx)
      await accounts.refetch()
    },
    onError: () => {
      toast.error('Failed to update journal entry');
    },
  })

  const deleteEntry = useMutation({
    mutationKey: ['journal', 'deleteEntry', { cluster, account }],
    mutationFn: async (title: string) => program.methods.delete(title).rpc(),
    onSuccess: async (tx) => {
      transactionToast(tx)
      await accounts.refetch()
    },
    onError: () => {
      toast.error('Failed to delete journal entry');
    },
  })

  return {
    accountQuery,
    updateEntry,
    deleteEntry,
  }
}
