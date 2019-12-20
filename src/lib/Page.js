import App from './App';
import Player from './Player';

class Page {
	constructor() {
		this.currentPage = undefined;
		this.lastPage = '/home';
		this.loggedIn = false;
	}

	setCurrentPage(page) {
		this.lastPage = this.currentPage;
		this.currentPage = page;
	}

	async loadPlayer() {
		Player.userId = App.firebase.getAuth().currentUser.uid;
		// load player info
		const docPlayer = await App.firebase.db.collection('users').doc(Player.userId).get();
		const playerInfo = docPlayer.data();
		Player.screenName = playerInfo.screenName;
		Player.avatar = playerInfo.avatar;
		Player.crew.crewCode = (playerInfo.crewCode === undefined) ? '' : playerInfo.crewCode;
		// check if player is moderator
		if (Player.crew.crewCode !== '') {
			const docCrewCode = await App.firebase.db.collection('crews').doc(Player.crew.crewCode).get();
			if (docCrewCode.exists && docCrewCode.moderator === Player.userId) {
				Player.crew.setPlayerModerator(true);
			}
		}
	}

	checkLoggedIn() {
		return new Promise((resolve) => {
			App.firebase.getAuth().onAuthStateChanged((user) => {
				if (user) {
					this.loadPlayer()
						.then(() => {
							this.loggedIn = true;
							console.log(`Logged in user: ${App._firebase.getAuth().currentUser.email}`);
							resolve(true);
						});
				} else {
					this.loggedIn = false;
					console.log('Logged in user: NONE');
					// reset player
					Player.resetParams();
					resolve(false);
				}
			});
		});
	}

	/* Checks if user should be on/has access to current page and reroutes */
	/**
	 * @description Checks if user should be on/has access to current page and reroutes
	 * @param {*} page page to redirect to
	 */
	checkAcces(page) {
		return new Promise((resolve) => {
			this.checkLoggedIn()
				.then((resp) => {
					if (resp) {
						if (page === '/register' || page === '/login') {
							console.log('ee');
							resolve(false);
						} else if (page === '/crewOverview' && Player.crew.crewCode === '') {
							resolve('/home');
						}
						resolve(true);
					} else {
						if (page === '/register' || page === '/registerAvatar' || page === '/login') {
							resolve(true);
						}
						resolve(false);
					}
					resolve(false);
				});
		});
	}
}

export default new Page();
