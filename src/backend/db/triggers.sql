create or replace function 
	CheckPlayerJoin() returns trigger as
$$
	declare
		numPlayers int;
	begin
		select
			g.numPlayers
		into
			numPlayers
		from
			Games g
		where
			g.id = new.gameId;

		-- 20 hardcoded limit, change if necessary
		if numPlayers >= 20 then
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
				numPlayers = numPlayers + 1
			where
				id = new.gameId;
		elsif TG_OP = 'DELETE' then
			update
				Games
			set
				numPlayers = numPlayers - 1
			where
				id = new.gameId;
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
			g.id = new.gameId;

		if new.amount > game.betLimit then
			raise exception 'Bet amount exceeds limit';
		elsif new.round != game.curRound then
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
before insert on UserGameSessions
for each row execute procedure CheckPlayerJoin();

create trigger UpdatePlayerCount
after insert or delete on UserGameSessions
for each row execute procedure UpdatePlayerCount();

create trigger UpdateBalanceAfterRound
after update on UserGameSessions
for each row execute procedure UpdateBalanceAfterRound();

create trigger UpdateBalanceAfterBet
after insert on Bets
for each row execute procedure UpdateBalanceAfterBet();

create trigger CheckBet
before insert on Bets
for each row execute procedure CheckBet();