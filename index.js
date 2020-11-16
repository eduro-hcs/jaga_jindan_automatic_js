const axios = require("axios");
const rsa_encrypt = require("./rsa_encrypt");

const fs = require("fs");
const credentials = JSON.parse(fs.readFileSync("./credentials.json", "utf8"));

(async () => {
	let jwt = (await axios.post(`https://${credentials['eduCode']}hcs.eduro.go.kr/v2/findUser`, JSON.stringify({
		birthday: rsa_encrypt(credentials['birthday']),
		loginType: 'school',
		name: rsa_encrypt(credentials['name']),
		orgCode: credentials['orgCode'],
		stdntPNo: null
	}), {
		headers: {
			"Content-Type": "application/json"
		},
		json: true
	})).data.token;

	if ((await axios.post(`https://${credentials['eduCode']}hcs.eduro.go.kr/v2/hasPassword`, JSON.stringify({}), {
		headers: {
			Authorization: jwt,
			'Content-Type': 'application/json'
		}
	})).data !== true) {
		console.log("자가진단 페이지에서 비밀번호를 설정해주세요.");
		process.exit(0);
	}


	if ((await axios.post(`https://${credentials['eduCode']}hcs.eduro.go.kr/v2/validatePassword`, JSON.stringify({
		'deviceUuid': '',
		'password': rsa_encrypt(credentials['password'])
	}), {
		headers: {
			Authorization: jwt,
			'Content-Type': 'application/json'
		}
	})).data !== true) {
		console.log("비밀번호를 잘못 입력했거나 로그인 시도 횟수를 초과하였습니다.");
		process.exit(0); //해당 부분 주석치면 비밀번호 확인 없이 진행 가능
	}

	const users = (await axios.post(`https://${credentials['eduCode']}hcs.eduro.go.kr/v2/selectUserGroup`, JSON.stringify({}), {
		headers: {
			Authorization: jwt,
			'Content-Type': 'application/json'
		},
		json: true
	})).data;

	jwt = users[0].token;
	const userNo = parseInt(users[0].userPNo);
	const org = users[0].orgCode;

	jwt = (await axios.post(`https://${credentials['eduCode']}hcs.eduro.go.kr/v2/getUserInfo`, JSON.stringify({
		userPNo: userNo,
		orgCode: org
	}), {
		headers: {
			Authorization: jwt,
			'Content-Type': 'application/json'
		},
		json: true
	})).data.token;

	const res = await axios.post(`https://${credentials['eduCode']}hcs.eduro.go.kr/registerServey`, JSON.stringify({
		'deviceUuid': '',
		'rspns00': 'Y',
		'rspns01': '1',
		'rspns02': '1',
		'rspns03': null,
		'rspns04': null,
		'rspns05': null,
		'rspns06': null,
		'rspns07': null,
		'rspns08': null,
		'rspns09': '0',
		'rspns10': null,
		'rspns11': null,
		'rspns12': null,
		'rspns13': null,
		'rspns14': null,
		'rspns15': null,
		'upperToken': jwt,
		'upperUserNameEncpt': credentials['name']
	}), {
		headers: {
			Authorization: jwt,
			'Content-Type': 'application/json'
		},
		json: true
	});

	console.log(res.data);
})();
