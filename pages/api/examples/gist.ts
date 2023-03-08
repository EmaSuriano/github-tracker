import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerOctokitAuth } from '../../../helpers/octokit';

const GIST_NAME = 'oss-projects.json';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const octokit = await getServerOctokitAuth(req, res);

    const { data: gists } = await octokit.request('GET /gists');
    const gistItemList = gists.find((gist) =>
      Object.keys(gist.files).includes(GIST_NAME),
    );

    if (!gistItemList) {
      return res
        .status(500)
        .json({ message: `Gist of "${GIST_NAME}" not found` });
    }

    const { data: gist } = await octokit.request('GET /gists/{gist_id}', {
      gist_id: gistItemList.id,
    });

    if (!gist.files || !gist.files[GIST_NAME]) {
      return res
        .status(500)
        .json({ message: `Gist of "${GIST_NAME}" not found` });
    }

    const file = gist.files[GIST_NAME];

    if (!file.content) {
      return res.status(500).json({ message: `No content present in Gist` });
    }

    const content = JSON.parse(file.content);

    return res.send(JSON.stringify(content, null, 2));
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch data', error });
  }
}
