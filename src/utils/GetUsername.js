import { dummyMentionsData } from '../plugins/MentionsPlugin.tsx'

const GetUsername = (id) => {
    const user = dummyMentionsData.find((user) => user.id === id);
    return user ? { name: user.name, deleted: user.deleted } : { name: '', deleted: true };

}

export default GetUsername;