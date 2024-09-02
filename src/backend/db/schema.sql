create domain pos_int as int check (value > 0);
create type status as enum('lobby', 'waiting', 'active', 'finished');

create table Users (
	id				text,
	username 		text unique not null,
	email 			text unique not null, -- delete?
	pw 				text not null,
	balance			int not null default 1000,
	created_at		timestamp not null default current_timestamp,
	primary key (id),
	-- modify this if needed 
	constraint username_check check (
		length(username) between 2 and 15
	)
);

create table UserTokens (
  userid			text,
  token				text,
  primary key (userid, token),
  foreign key (userid) references Users(id)
);

-- update cur_round after every round
create table Games (
	id  			text,
	host			text not null,
	max_players 	pos_int not null default 10, -- delete this? just have a reasonable hardcoded limit
	num_players		int not null default 1,
	game_status 	status default 'lobby',
	num_rounds 		pos_int not null default 5,
	cur_round		pos_int not null default 1,
	bet_limit		pos_int not null default 500, 
	round_time		pos_int not null default 30, 
	-- add more 
	primary key (id),
	foreign key (host) references Users(id)
	constraint round_check check(
		cur_round <= num_rounds
	)
);

-- update winnings after every round
-- trigger on add to check if number of players > max_players
create table ActiveSessions (
	userid			text,
	gameid			text,
	winnings		int not null default 0,
	primary key (userid, gameid),
	foreign key (gameid) references Games(id) on delete cascade,
	foreign key (userid) references Users(id) on delete cascade
);

-- trigger to check that amount <= bet_limit, round <= num_rounds 
create table Bets (
	userid			text,
	gameid			text,
	round			pos_int, 
	amount			pos_int not null,
	primary key (userid, gameid, round),
	foreign key (gameid) references Games(id) on delete cascade,
	foreign key (userid) references ActiveSessions(userid) on delete cascade
);
