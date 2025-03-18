export interface Deadline {
    secondsLeft: number;
}

export interface DeadlineResponse {
    secondsLeft: number;
}

export interface ApiError {
    statusCode: number;
    message: string;
    timestamp: string;
}
