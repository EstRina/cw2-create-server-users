export type User = {
    id: number,
    userName: string
}

const users: User[] = [{id:1, userName:"Bond"}]

export  const addUser= (user: User):boolean => {
    if(users.findIndex(elem => elem.id == user.id) === -1){
        users.push(user)
        return true;
    }
    return false;
}

export const getAllUsers = () => [...users];

export const updateUser = (newUserData:User):boolean => {
    const userIndex = users.findIndex(user => user.id === newUserData.id);
    if (userIndex !== -1) {
        users[userIndex] = newUserData;
        return true;
    }
    return false;
}

export const removeUser = (userId: number | null):User | null => {
    const userIndex = users.findIndex(user => user.id === userId);
    if(userIndex !== -1) {
        const removedUser = users[userIndex];
        users.splice(userIndex, 1);
        return removedUser;
    }
    return null;
}

export const getUser = (userId: number | null):User | null => {
    const user = users.find(user => user.id === userId);
    return user || null;
}








