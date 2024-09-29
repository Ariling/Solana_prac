use anchor_lang::prelude::*;

declare_id!("37UXLQTzMZXpGEXuqcBKfCD8bvpqkiRhL4sbbMMyzUhy");

#[program]
pub mod solana_test {
    use super::*;

    pub fn greet(_ctx: Context<Initialize>) -> Result<()> {
        msg!("GM!");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
