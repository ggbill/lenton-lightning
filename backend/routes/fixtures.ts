import { Request, Response } from 'express';
import { FixtureController } from '../controllers/fixture.controller';

const router = require('express').Router();

router.get('/', async (request: Request, response: Response) => {
    try {
        const result = await FixtureController.GetFixtures();
        response.json(result);
        response.end();
    }catch (err){
        response.status(500);
        response.end;
        console.error("Error: ", err)
    }
});

router.get('/:id', async (request: Request, response: Response) => {
    try {
        const result = await FixtureController.GetFixtureById(request.params.id);
        response.json(result);
        response.end();
    }catch (err){
        response.status(500);
        response.end;
        console.error("Error: ", err)
    }
});

router.put('/:id', async (request: Request, response: Response) => {
    try {
        const result = await FixtureController.UpdateFixture(request.params.id, request.body);
        response.json(result);
        response.end();
    }catch (err){
        response.status(500);
        response.end;
        console.error("Error: ", err)
    }
});

router.post('/', async (request: Request, response: Response) => {
    try {
        const result = await FixtureController.CreateFixture(request.body);
        response.json(result);
        response.end();
    }catch (err){
        response.status(500);
        response.end;
        console.error("Error: ", err)
    }
});

export default router;

