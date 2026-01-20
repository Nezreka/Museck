import { ReactRouter } from '../webpack';
export const useParams = Object.values(ReactRouter).find((val) => /return (\w)\?\1\.params:{}/.test(`${val}`));
