import { airportService } from "./airport";

export default async function runServicesInit() {
    await airportService.init();
}
