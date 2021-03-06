import React, { useState } from "react"
import './season.scss'
import PlayerSeasonStatsTable from "../player/PlayerSeasonStatsTable"
import useFetch from "../../hooks/useFetch"
import moment from 'moment'
import FixtureCard from '../fixture/FixtureCard'
import DeleteIcon from '@material-ui/icons/Delete'
import EditIcon from '@material-ui/icons/Edit'
import { Button } from "@material-ui/core";
import ConfigureFixtureDialog from "../fixture/ConfigureFixtureDialog"
import SeasonHeader from "./SeasonHeader"
import {
    useParams
} from "react-router-dom";
import Loading from "../shared/Loading"
import SeasonAccoladeSection from "./SeasonAccoladeSection"
import SeasonTeamSection from "./SeasonTeamSection"
import SeasonPlayerSection from "./SeasonPlayerSection"

interface InputProps {
    auth: any
}

const Season = (props: InputProps) => {
    const { isAuthenticated } = props.auth;
    const { id } = useParams();

    const seasonsApi = useFetch("seasons");

    const fixturesApi = useFetch("fixtures");

    const [seasonId] = React.useState<string>(
        // match.params.id
        id
    );

    const [season, setSeason] = React.useState<App.Season>({
        _id: "",
        name: "",
        location: "",
        imageUrl: "",
        startDate: new Date(),
        endDate: new Date(),
        teamList: [],
        playerList: [],
        fixtureList: [],
        accoladeList: [],
        isActive: false
    });

    const [fixtureList, setFixtureList] = useState<App.Fixture[]>([])
    const [isFixtureUpdated, setIsFixtureUpdated] = useState<boolean>(false)
    const [isSeasonUpdated, setIsSeasonUpdated] = useState<boolean>(false)
    const [futureFixtureList, setFutureFixtureList] = useState<App.Fixture[]>([]);
    const [pastFixtureList, setPastFixtureList] = useState<App.Fixture[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [isAddFixtureDialogOpen, setIsAddFixtureDialogOpen] = React.useState<boolean>(false);
    const [isEditFixtureDialogOpen, setIsEditFixtureDialogOpen] = React.useState<boolean>(false);
    const [fixture, setfixture] = React.useState<App.Fixture>({
        _id: "",
        fixtureType: "",
        kickoffDateTime: new Date(),
        result: "",
        goalsAgainst: 0,
        oppositionOwnGoals: 0,
        isPenalties: false,
        opposition: {
            _id: "",
            name: "",
            isActive: true
        },
        players: [],
        isActive: true
    });

    const getSeasonById = (seasonId: string): void => {
        setLoading(true)
        seasonsApi.get(seasonId)
            .then((data: App.Season) => {
                setSeason(data)
                setFixtureList(data.fixtureList)
                sortFixtures(data)
                setLoading(false)
            })
            .catch((err: Error) => {
                setError(err.message)
            })
    }

    const updateSeason = (season: App.Season): void => {
        setLoading(true)
        seasonsApi.put(season._id, season)
            .then(data => {
                setLoading(false)
            })
            .catch((err: Error) => {
                setLoading(false)
                setError(err.message)
            })
    }

    const createFixture = (fixture: App.Fixture): void => {
        setLoading(true)
        fixturesApi.post(fixture)
            .then(data => {
                var updatedList = fixtureList.concat(data);
                setFixtureList(updatedList);
                setIsFixtureUpdated(true)
                setLoading(false)
            })
            .catch((err: Error) => {
                setLoading(false)
                setError(err.message)
            })
    }

    const updateFixture = (fixture: App.Fixture): void => {
        setLoading(true)
        fixturesApi.put(fixture._id, fixture)
            .then(data => {
                getSeasonById(seasonId)
                setLoading(false)
            })
            .catch((err: Error) => {
                setLoading(false)
                setError(err.message)
            })
    }

    React.useEffect(() => {
        getSeasonById(seasonId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    React.useEffect(() => {
        if (isFixtureUpdated) {
            setSeason({ ...season, fixtureList: fixtureList })
            setIsFixtureUpdated(false)
            setIsSeasonUpdated(true)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isFixtureUpdated]);

    React.useEffect(() => {
        if (isSeasonUpdated) {
            updateSeason(season)
        }
        setIsSeasonUpdated(false)
    }, [isSeasonUpdated]);

    const removeFixture = (id): void => {
        var updatedList = fixtureList.filter(team =>
            team._id !== id
        );
        setFixtureList(updatedList);
        setIsFixtureUpdated(true)
    }

    const sortFixtures = (season: App.Season) => {
        let now = moment()
        let pastFixtureList: App.Fixture[] = []
        let futureFixtureList: App.Fixture[] = []

        season.fixtureList.forEach(fixture => {
            if (moment(fixture.kickoffDateTime).isBefore(now)) {
                pastFixtureList.push(fixture)
            } else if (moment(fixture.kickoffDateTime).isAfter(now)) {
                futureFixtureList.push(fixture)
            }
        });

        pastFixtureList.sort((a, b) => {
            return (a.kickoffDateTime < b.kickoffDateTime ? -1 : 1)
        })
        futureFixtureList.sort((a, b) => {
            return (a.kickoffDateTime < b.kickoffDateTime ? -1 : 1)
        })

        setPastFixtureList(pastFixtureList)
        setFutureFixtureList(futureFixtureList)
    }

    const handleEditFixtureDialogClose = () => {
        setIsEditFixtureDialogOpen(false)
        setfixture({
            _id: "",
            fixtureType: "",
            kickoffDateTime: new Date(),
            result: "",
            goalsAgainst: 0,
            oppositionOwnGoals: 0,
            isPenalties: false,
            opposition: {
                _id: "",
                name: "",
                isActive: true
            },
            players: [],
            isActive: true
        })
    };

    const handleEditFixtureDialogOpen = (fixture: App.Fixture) => {
        setfixture(fixture)
        setIsEditFixtureDialogOpen(true)
    };

    const handleAddFixtureDialogOpen = () => {
        setIsAddFixtureDialogOpen(true)
    };

    const handleAddFixtureDialogClose = () => {
        setIsAddFixtureDialogOpen(false)
        setfixture({
            _id: "",
            fixtureType: "",
            kickoffDateTime: new Date(),
            result: "",
            goalsAgainst: 0,
            oppositionOwnGoals: 0,
            isPenalties: false,
            opposition: {
                _id: "",
                name: "",
                isActive: true
            },
            players: [],
            isActive: true
        })
    };

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
        <>
            <SeasonHeader season={season} />
            <div className="content">
                <SeasonAccoladeSection
                    auth={props.auth}
                    season={season}
                    setSeason={setSeason}
                    setIsSeasonUpdated={setIsSeasonUpdated}
                />
                <div style={{ display: futureFixtureList.length ? 'block' : 'none' }}>
                    <h2>Fixtures</h2>
                    {futureFixtureList.map(fixture => {
                        return (
                            <div className="fixture-card-div" key={fixture._id}>
                                <FixtureCard fixture={fixture} />
                                {isAuthenticated() &&
                                    <div className="admin-buttons">
                                        <Button variant="text" onClick={() => handleEditFixtureDialogOpen(fixture)}>
                                            <EditIcon />
                                        </Button>
                                        <Button variant="text" onClick={() => removeFixture(fixture._id)}>
                                            <DeleteIcon />
                                        </Button>
                                    </div>
                                }

                            </div>
                        )
                    })}
                    <br />
                </div>

                <div style={{ display: pastFixtureList.length ? 'block' : 'none' }}>
                    <h2>Results</h2>
                    {pastFixtureList.map(fixture => {
                        return (
                            <div className="fixture-card-div" key={fixture._id}>
                                <FixtureCard
                                    fixture={fixture}
                                />
                                {isAuthenticated() &&
                                    <div className="admin-buttons">
                                        <Button variant="text" onClick={() => handleEditFixtureDialogOpen(fixture)}>
                                            <EditIcon />
                                        </Button>
                                        <Button variant="text" onClick={() => removeFixture(fixture._id)}>
                                            <DeleteIcon />
                                        </Button>
                                    </div>
                                }
                            </div>
                        )
                    })}
                </div>
                {isAuthenticated() &&
                    <Button onClick={handleAddFixtureDialogOpen} color="primary">
                        Add
                    </Button>
                }
                <br />

                <div style={{ display: pastFixtureList.length ? 'block' : 'none' }}>
                    <h2>Player Stats</h2>
                    <PlayerSeasonStatsTable
                        seasonId={seasonId}
                    />
                </div>


                {isAuthenticated() &&
                    <>
                        <SeasonTeamSection
                            season={season}
                            setSeason={setSeason}
                            setIsSeasonUpdated={setIsSeasonUpdated}
                        />
                        <SeasonPlayerSection
                            season={season}
                            setSeason={setSeason}
                            setIsSeasonUpdated={setIsSeasonUpdated}
                        />
                    </>
                }

            </div>

            {/* Edit Fixture Dialog */}
            <ConfigureFixtureDialog
                isFixtureDialogOpen={isEditFixtureDialogOpen}
                handleClose={handleEditFixtureDialogClose}
                createFixture={createFixture}
                updateFixture={updateFixture}
                teamList={season.teamList}
                playerList={season.playerList}
                isCreateFixtureDialog={false}
                fixture={fixture}
            />

            {/* Create Fixture Dialog */}
            <ConfigureFixtureDialog
                isFixtureDialogOpen={isAddFixtureDialogOpen}
                handleClose={handleAddFixtureDialogClose}
                createFixture={createFixture}
                updateFixture={updateFixture}
                teamList={season.teamList}
                playerList={season.playerList}
                isCreateFixtureDialog={true}
                fixture={fixture}
            />
        </>
    )
}

export default Season