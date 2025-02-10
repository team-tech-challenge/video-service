const defaultReturnStatement = (
	response: any,
	responseName: string,
	value: any
) => {
	return response.json({ [responseName]: value });
};

const formatObjectResponse = (includedObject, objectName: string) => {
	let result = [];
	includedObject.map((object) => { 		
		result.push(object[objectName]['dataValues']); 
	});
	return result;
};

const handleError = (res, error) => {
	return res.status(500).json({ error: error.message });
}

export { defaultReturnStatement, formatObjectResponse, handleError };
