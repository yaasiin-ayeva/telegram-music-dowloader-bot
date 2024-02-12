export default interface YoutubeApiSearchParams {
    q: string;
    part: string;
    type: string;
    key: string | undefined;
    maxResults?: number;
    pageToken?: string;
}