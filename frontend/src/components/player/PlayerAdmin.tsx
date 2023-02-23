import React, { useState } from "react"
import './player.scss'
import useFetch from "../../hooks/useFetch"
import PlayerCard from "./PlayerCard"
import { Box, Select, FormControl, InputLabel, MenuItem, Button } from '@material-ui/core';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import ConfigurePlayerDialog from "./ConfigurePlayerDialog";
import Loading from "../shared/Loading";

interface SeasonStat {
    seasonName: string,
    seasonId: string,
    capCount: number,
    goalCount: number,
    motmCount: number,
    winCount: number,
    lossCount: number
}

interface PlayerCareerStat {
    player: any,
    seasonStatList: SeasonStat[],
    capTotal: number,
    goalTotal: number,
    motmTotal: number,
    winTotal: number,
    lossTotal: number
}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            flexGrow: 1,
        },
        paper: {
            padding: theme.spacing(2),
            textAlign: 'center',
            color: theme.palette.text.secondary,
        },
        formControl: {
            margin: '8px 0',
            minWidth: 120,
        },
        selectEmpty: {
            marginTop: theme.spacing(2),
        },
    }),
);

interface InputProps {
    auth: any
}

const PlayerAdmin = (props: InputProps) => {

    const { isAuthenticated } = props.auth;

    const classes = useStyles();

    const playersApi = useFetch("players");
    const seasonsApi = useFetch("seasons");

    const [fullPlayerCareerStatList, setFullPlayerCareerStatList] = useState<PlayerCareerStat[]>([]);
    const [playerCareerStatList, setPlayerCareerStatList] = useState<PlayerCareerStat[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [orderBy, setOrderBy] = useState<string>("CAPS");
    const [isAddPlayerDialogOpen, setIsAddPlayerDialogOpen] = useState<boolean>(false);
    const [player, setPlayer] = useState({
        _id: "",
        firstName: "",
        surname: "",
        imageUrl: "",
        isActive: true
    });

    const GetAllPlayerCareerStats = (): void => {
        setLoading(true)
        seasonsApi.get('allPlayersCareerStats')
            .then(data => {
                setFullPlayerCareerStatList(data)
                // setPlayerOrder("CAPS")
                setLoading(false)
            })
            .catch((err: Error) => {
                setError(err.message)
            })
    }

    const createPlayer = (player: App.Player): void => {
        setLoading(true)
        playersApi.post(player)
            .then(data => {

                GetAllPlayerCareerStats()
                setLoading(false)
            })
            .catch((err: Error) => {
                setLoading(false)
                setError(err.message)
            })
    }

    const updatePlayer = (player: App.Player): void => {
        setLoading(true)
        playersApi.put(player._id, player)
            .then(data => {
                GetAllPlayerCareerStats();
                setLoading(false)
            })
            .catch((err: Error) => {
                setLoading(false)
                setError(err.message)
            })
    }

    const deletePlayer = (id): void => {
        let playerToDelete;
        playerCareerStatList.forEach(playerCareerStat => {
            if (playerCareerStat.player._id === id) {
                playerToDelete = playerCareerStat.player;
                playerToDelete.isActive = false;
            }
        });

        updatePlayer(playerToDelete);
    }

    // const setPlayerOrder = (orderBy: string, playerCareerStatList: PlayerCareerStat[]) => {
    const setPlayerOrder = (orderBy: string) => {
        if (orderBy === "CAPS") {
            let orderedList = fullPlayerCareerStatList.sort((a, b) => {
                return (a.capTotal > b.capTotal ? -1 : 1)
            })
            setPlayerCareerStatList(orderedList);
        } else if (orderBy === "NAME") {
            let orderedList = fullPlayerCareerStatList.sort((a, b) => {
                return (`${a.player.firstName} ${a.player.surname}` < `${b.player.firstName} ${b.player.surname}` ? -1 : 1)
            })
            setPlayerCareerStatList(orderedList);
        } else if (orderBy === "GOALS") {
            let orderedList = fullPlayerCareerStatList.sort((a, b) => {
                return (a.goalTotal > b.goalTotal ? -1 : 1)
            })
            setPlayerCareerStatList(orderedList);
        } else if (orderBy === "WIN") {
            let orderedList = fullPlayerCareerStatList.sort((a, b) => {
                return ((a.winTotal / a.capTotal) > (b.winTotal / b.capTotal) ? -1 : 1)
            }).filter(player => player.capTotal > 9)
            setPlayerCareerStatList(orderedList);
        }
    }

    const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        setOrderBy(event.target.value as string);
        setPlayerOrder(event.target.value as string)
    };

    const clearPlayerObject = () => {
        setPlayer({
            _id: "",
            firstName: "",
            surname: "",
            imageUrl: "",
            isActive: true
        })
    }

    const handleAddPlayerDialogOpen = () => {
        setIsAddPlayerDialogOpen(true)
    };

    const handleAddPlayerDialogClose = () => {
        setIsAddPlayerDialogOpen(false)
        clearPlayerObject()
    };

    React.useEffect(() => {
        GetAllPlayerCareerStats();
        // eslint-disable-next-line react-hooks/exhaustive-deps       
    }, []);

    React.useEffect(() => {
        if (fullPlayerCareerStatList.length > 0) setPlayerOrder("CAPS")
            
    }, [fullPlayerCareerStatList]);

    if (loading) {
        return (
            <Loading />
        )
    }

    if (error) {
        return (
            <i>{error}</i>
        )
    }

    return (
        <div className="content menu-bar-margin">
            <h2>Player List</h2>
            <FormControl className={classes.formControl}>
                <InputLabel id="order-by-select">Sort</InputLabel>
                <Select
                    id="order-by-select"
                    value={orderBy}
                    onChange={handleChange}
                >
                    <MenuItem value={"NAME"}>By Name</MenuItem>
                    <MenuItem value={"CAPS"}>Most Caps</MenuItem>
                    <MenuItem value={"GOALS"}>Most Goals</MenuItem>
                    <MenuItem value={"WIN"}>Win Percentage</MenuItem>
                </Select>
            </FormControl>
            <div className={classes.root} >
                {orderBy === "WIN" && 
                <span>List filtered to players with 10 or more caps.</span>
                }
                <Box display="flex" flexDirection="row" flexWrap="wrap" justifyContent="space-evenly">
                    {playerCareerStatList.map((item: PlayerCareerStat) => (
                        <div key={item.player._id}>
                            <PlayerCard
                                player={item.player}
                                caps={item.capTotal}
                                goals={item.goalTotal}
                                winPercentage={(item.winTotal / item.capTotal * 100)}
                                auth={props.auth}
                                deletePlayer={deletePlayer}
                                updatePlayer={updatePlayer}
                                createPlayer={createPlayer}
                            />
                        </div>
                    ))}
                </Box>
            </div>
            {isAuthenticated() &&
                <Button onClick={handleAddPlayerDialogOpen} color="primary">
                    Add
                </Button>
            }

            {/* Create Player Dialog */}
            <ConfigurePlayerDialog
                handleClose={handleAddPlayerDialogClose}
                updatePlayer={updatePlayer}
                createPlayer={createPlayer}
                isDialogOpen={isAddPlayerDialogOpen}
                player={player}
                isCreatePlayerDialog={true}
            />
        </div>
    )
}

export default PlayerAdmin