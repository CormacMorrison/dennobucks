create or replace function 
	CheckPlayerJoin() returns trigger as
$$
	declare
		num_players int;
	begin
		select
			g.num_players
		into
			num_players
		from
			Games g
		where
			g.id = new.gameid;

		-- 20 hardcoded limit, change if necessary
		if num_players >= 20 then
			raise exception 'Maximum players reached';
		end if;

		return new;
	end;
$$ language plpgsql;

create or replace function 
	UpdatePlayerCount() returns trigger as
$$	
	begin
		if TG_OP = 'INSERT' then
			update
				Games
			set
				num_players = num_players + 1
			where
				id = new.gameid;
		elsif TG_OP = 'DELETE' then
			update
				Games
			set
				num_players = num_players - 1
			where
				id = new.gameid;
		end if; 

		return new;
	end;
$$ language plpgsql;

-- might just put this functionality somewhere else 
create or replace function
	UpdateBalanceAfterRound() returns trigger as
$$
	begin
		update
			Users
		set
			balance = balance + new.winnings - old.winnings
		where
			id = new.userid;
	end;
$$ language plpgsql;

create or replace function
	CheckBet() returns trigger as
$$
	declare
		game record;
	begin
		select
			*
		into
			game
		from
			Games g
		where
			g.id = new.gameid;

		if new.amount > game.bet_limit then
			raise exception 'Bet amount exceeds limit';
		elsif new.round != game.cur_round then
			raise exception 'Invalid round number';
		end if;
	end;
$$ language plpgsql;

create or replace function
	UpdateBalanceAfterBet() returns trigger as
$$
	begin
		update
			Users
		set
			balance = balance - new.amount
		where
			id = new.userid;	
	end;
$$ language plpgsql;

create trigger CheckPlayerJoin
before insert on ActiveSessions
for each row execute procedure CheckPlayerJoin();

create trigger UpdatePlayerCount
after insert or delete on ActiveSessions
for each row execute procedure UpdatePlayerCount();

create trigger UpdateBalanceAfterRound
after update on ActiveSessions
for each row execute procedure UpdateBalanceAfterRound();

create trigger UpdateBalanceAfterBet
after insert on Bets
for each row execute procedure UpdateBalanceAfterBet();

create trigger CheckBet
before insert on Bets
for each row execute procedure CheckBet();