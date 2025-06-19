#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("CcZL6ZukdvR2KTUxGttsjD9tDWtUk5oLBphpL8nyLdP5");

#[program]
pub mod journal {
    use super::*;

    pub fn create(
        ctx: Context<CreateEntry>,
        title: String,
        message: String,    
    ) -> Result<()> {
        
        let journal_entry = &mut ctx.accounts.journal_entry;
        journal_entry.owner = ctx.accounts.owner.key();
        journal_entry.title = title;
        journal_entry.message = message;
        //log
        msg!(
            "Journal entry created: {} by {}",
            journal_entry.title,
            journal_entry.owner
        );
        msg!(
            "Message: {}",
            journal_entry.message
        );
        Ok(())
    }

    pub fn update(
        ctx: Context<UpdateEntry>,
        _title: String,
        message: String,
    ) -> Result<()> {
        let journal_entry = &mut ctx.accounts.journal_entry;
        journal_entry.message = message;
        //log
        msg!(
            "Journal entry updated: {} by {}",  
            journal_entry.title,
            journal_entry.owner
        );
        msg!(
            "New message: {}",
            journal_entry.message
        );
        Ok(())
    }
    pub fn delete(
        _ctx: Context<DeleteEntry>,
        _title: String,
    ) -> Result<()> {
        Ok(())
    }

   
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct CreateEntry<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + JournalEntryState::INIT_SPACE,
        seeds = [title.as_bytes(), owner.key().as_ref()],
        bump
    )]
    pub journal_entry: Account<'info, JournalEntryState>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct JournalEntryState {
    pub owner: Pubkey,
    #[max_len(50)]
    pub title: String,
    #[max_len(1000)]
    pub message: String,
} 

#[derive(Accounts)]
#[instruction(title: String)]
pub struct UpdateEntry<'info> {
    #[account(
        mut,
        seeds = [title.as_bytes(), owner.key().as_ref()],
        bump,
        realloc = 8 + JournalEntryState::INIT_SPACE ,
        realloc::payer = owner, 
        realloc::zero = true,
    )]
    pub journal_entry: Account<'info, JournalEntryState>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct DeleteEntry<'info> {
    #[account(
        mut,
        seeds = [title.as_bytes(), owner.key().as_ref()],
        bump,
        close = owner, // Close the account and transfer lamports to the owner
    )]
    pub journal_entry: Account<'info, JournalEntryState>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}
