import { useEffect, useState } from "react";
import { calculateDistanceBtw, placeTravelOrder } from "../../externals/server/air-travel";
import { orderStore } from "../../externals/store";

export function useHomePage() {
    const [fromAirport, setFromAirport] = useState<Airport | null>(null);
    const [toAirport, setToAirport] = useState<Airport | null>(null);
    const [airportDistance, setAirportDistance] = useState(0);

    function handlePayment() {
        if (!(fromAirport && toAirport)) return;

        placeTravelOrder(fromAirport.id, toAirport.id).then((orderDetails) => {
            orderStore.save(orderDetails);
            window.open(orderDetails.payment_url, "_self");
        });
    }

    useEffect(() => {
        if (!(fromAirport && toAirport)) return;

        calculateDistanceBtw(fromAirport.id, toAirport.id)
            .then(setAirportDistance)
            .catch(() => alert("Error obtaining distance"));
    }, [fromAirport, toAirport]);

    return {
        setFromAirport,
        setToAirport,
        handlePayment,
        airportDistance: airportDistance ? airportDistance + " km" : "_",
    };
}

interface Airport {
    id: string;
    name: string;
}
