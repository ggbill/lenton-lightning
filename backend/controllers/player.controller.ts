import Player, { IPlayer } from '../models/player.model';
var mongoose = require('mongoose');

export namespace PlayerController {

    export async function GetPlayers(): Promise<IPlayer[]> {
        return new Promise((resolve: (result: IPlayer[]) => void, reject: (error: Error) => void) => {
            Player
                .find({isActive: true}, function (err, result) {
                    if (err) {
                        console.error("Error: " + err);
                    }
                    resolve(result);
                });
        });
    }

    export async function GetPlayerById(id: string): Promise<any> {
        return new Promise((resolve: (result) => void, reject: (error: Error) => void) => {
            Player.findById({_id: id, isActive: true}, function (err, result) {
                if (err) {
                    console.error("Error: " + err);
                }
                resolve(result);
            });
        });
    }

    export async function CreatePlayer(player: IPlayer): Promise<IPlayer> {
        return new Promise((resolve: (result) => void, reject: (error: Error) => void) => {
            Player.create({
                firstName: player.firstName,
                surname: player.surname,
                imageUrl: player.imageUrl,
                isActive: true
            }, function (err, result: IPlayer) {
                if (err) {
                    console.error("Error: " + err);
                }
                resolve(result);
            });
        });
    }

    export async function UpdatePlayer(id: string, player: IPlayer): Promise<IPlayer> {
        return new Promise((resolve: (result) => void, reject: (error: Error) => void) => {
            Player.findByIdAndUpdate(id, {...player}, function (err, result) {
                if (err) {
                    console.error("Error: " + err);
                }
                resolve(result);
            });
        });
    }
}