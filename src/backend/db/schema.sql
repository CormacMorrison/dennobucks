create domain posInt as int check (value > 0);
create type status as enum('lobby', 'waiting', 'active', 'finished');

create table Users (
	id				  varchar(36),
	username 		text unique not null,
	email 			text unique,
	pw 				  text not null,
	balance			int not null default 1000,
	createdAt		timestamp not null default current_timestamp,
	primary key (id),
	-- modify this if needed 
	constraint usernameCheck check (
		length(username) between 2 and 15
	)
);

-- create table Sessions (
--   userId			varchar(36),
--   token				varchar(36),
--   primary key (userId, token),
--   foreign key (userId) references Users(id)
-- );

-- update cur_round after every round
create table Games (
	id  			  varchar(36),
	host			  varchar(36) not null,
	maxPlayers 	posInt not null default 10, -- delete this? just have a reasonable hardcoded limit
	numPlayers	int not null default 1,
	gameStatus 	status default 'lobby',
	numRounds 	posInt not null default 5,
	curRound		posInt not null default 1,
	betLimit		posInt not null default 500, 
	roundTime		posInt not null default 30, 
	-- add more 
	primary key (id),
	foreign key (host) references Users(id),
	constraint roundCheck check(
		curRound <= numRounds
	)
);

-- update winnings after every round
-- trigger on add to check if number of players > max_players
create table UserGameSessions (
	userId			varchar(36),
	gameId			varchar(36),
	winnings		int not null default 0,
	primary key (userId, gameId),
	foreign key (gameId) references Games(id) on delete cascade,
	foreign key (userId) references Users(id) on delete cascade
);

-- trigger to check that amount <= bet_limit, round <= num_rounds 
create table Bets (
	userId			varchar(36),
	gameId			varchar(36),
	round			  posInt, 
	amount			posInt not null,
	primary key (userId, gameId, round),
	-- foreign key (gameId) references Games(id) on delete cascade,
	foreign key (userId, gameId) references UserGameSessions(userId, gameId) on delete cascade
);
