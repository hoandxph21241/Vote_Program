use anchor_lang::prelude::*;

declare_id!("14QVpkDdhrJwMkBxndkvte46Rr1TycYSx1YB73PHtitZ");

#[program]
mod vote_program {
    use super::*;
    pub fn initialize(ctx: Context<Initialize>, data: u64) -> Result<()> {
        ctx.accounts.new_account.data = data;
        msg!("Dữ liệu đã thay đổi thành: {}!", data);
        Ok(())
    }

    pub fn add_candidate(ctx: Context<AddCandidate>, nickname: String) -> Result<()> {
        let candidate = &mut ctx.accounts.candidate;
        candidate.nickname = nickname;
        candidate.vote_count = 0;
        Ok(())
    }

    pub fn vote(ctx: Context<Vote>) -> Result<()> {
        let candidate = &mut ctx.accounts.candidate;
        candidate.vote_count += 1;
        Ok(())
    }

    pub fn view_vote(ctx: Context<ViewVote>) -> Result<()> {
        let candidate = &ctx.accounts.candidate;
        msg!(
            "{} có {} phiếu bầu",
            candidate.nickname,
            candidate.vote_count
        );
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = signer, space = 8 + 8)]
    pub new_account: Account<'info, NewAccount>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AddCandidate<'info> {
    #[account(init, payer = signer, space = 8 + 32 + 8)]
    pub candidate: Account<'info, Candidate>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Candidate {
    pub nickname: String,
    pub vote_count: u64,
}

#[derive(Accounts)]
pub struct Vote<'info> {
    #[account(mut)]
    candidate: Account<'info, Candidate>,
}

#[derive(Accounts)]
pub struct ViewVote<'info> {
    #[account(signer)]
    voter: AccountInfo<'info>,
    #[account(mut)]
    candidate: Account<'info, Candidate>,
}

#[account]
pub struct NewAccount {
    data: u64,
}
