import express from "express";
import { airportService } from "../services";
import { parseReqBody } from "./parse-req-body";
import { send200, send400, sendServerError, Data } from "./res-send-fns";
import { catchAsyncRouteErr } from "./wrap-async-route";

const router = express.Router();

// TODO: Turn to class and decouple the dependencies for easy testing and maintainence
router.get("/", (req, res) => {
    const query = <GetAirportsQuery>req.query;

    const countryOrLocationSearch = query.country || "";
    const offset = +(query.offset || 0);
    const batch = +(query.batch || 30);
    airportService
        .getAirports({
            countryOrLocationSearch,
            offset,
            batch,
        })
        .then((airports) => {
            send200(res, { airports }, { offset, batch: airports.length });
        })
        .catch((err) => {
            sendServerError(res, err);
        });
});

router.get("/calculate-distance", (req, res) => {
    const query = <CalculateDistanceQuery>req.query;

    const fromAirportUUID = query.from_airport;
    const toAirportUUID = query.to_airport;

    if (fromAirportUUID == null || toAirportUUID == null)
        return sendServerError(res, "Please provide from_airport and to_airport in query");

    airportService
        .getDistanceBtw(fromAirportUUID, toAirportUUID)
        .then((distance) => {
            send200(res, { distance });
        })
        .catch((err) => {
            sendServerError(res, err);
        });
});

router.post(
    "/place-order",
    catchAsyncRouteErr(async (req, res) => {
        const body: Partial<PlaceOrderBody> = await parseReqBody(req);
        const fromAirportUUID = body.from_airport;
        const toAirportUUID = body.to_airport;

        if (!(fromAirportUUID && toAirportUUID))
            return sendServerError(res, "Please provide from_airport and to_airport in body");

        airportService
            .placeOrder(fromAirportUUID, toAirportUUID)
            .then((orderDetails) => {
                if (orderDetails)
                    return send200(res, <any>{
                        orderDetails,
                    });
                return send400(res, "Payment failed");
            })
            .catch((err) => {
                sendServerError(res, err);
            });
    })
);

// TODO: Implement validations for all incoming data in routes
router.get("/get-order-details", (req, res) => {
    const query = <Partial<GetOrderDetailsQuery>>req.query;
    const id = query.id?.toString();

    if (!id) return sendServerError(res, "Please provide id in query");
    airportService
        .getOrdersDetailsBy(id)
        .then((order) => {
            if (order) return send200(res, <any>order); // TODO: Resolve this any issue
            return send400(res, "Failed");
        })
        .catch((err) => {
            sendServerError(res, err);
        });
});

router.post(
    "/update-payment-status",
    catchAsyncRouteErr(async (req, res) => {
        const body: Partial<UpdatePaymentStatusBody> = await parseReqBody(req);
        console.log("Place order router", body);

        const id = body.id?.toString();

        if (!id) return sendServerError(res, "Please provide id in body");

        airportService
            .updatePaymentStatus(id)
            .then(() => {
                return send200(res);
            })
            .catch((err) => {
                sendServerError(res, err);
            });
    })
);

interface GetAirportsQuery {
    country?: string;
    offset?: string;
    batch?: string;
}

interface CalculateDistanceQuery {
    from_airport?: string;
    to_airport?: string;
}

interface GetOrderDetailsQuery {
    id: string;
}

// Good from here
interface PlaceOrderBody {
    from_airport: string;
    to_airport: string;
}

interface UpdatePaymentStatusBody {
    id: string;
}

export default router;
