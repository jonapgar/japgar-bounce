const bouncing = {}
const wait = require('japgar-wait')

function bounce(key,options={}) {
	if (key instanceof Array) {
		return Promise.all(key.map(key=>bounce(key,options)))
	}
	let {simultaneous = 20,expire = 2000,grace=300,delay=50} = options
	let b = bouncing[key] = bouncing[key] || []
	let t
	b.push(t = setLooseTimeout(()=>{
		b.splice(b.indexOf(t),1)
	},expire))
	let count = b.length

	if (count > simultaneous) 
		throw new Error('Rate Limited')

	let ms = delay*(count-simultaneous)
	if (ms < grace)
		return
	
	return wait(ms)
}
function unbounce(...keys) {
	keys.forEach(key=>{
		if (key instanceof Array) {
			return unbounce(key)
		}
		let b = bouncing[key]
		if (b)
			clearLooseTimeout(b.shift()) //for now we just remove the oldest bounce.
	})
}

module.exports = {
	bounce,unbounce,bouncing
}