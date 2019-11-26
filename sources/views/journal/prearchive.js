import {JetView} from "webix-jet";
import AllTActions from "views/datatables/alltactions";

export default class PreArchiveView extends JetView{
		config(){
		const main = {
			rows: [
				AllTActions
			]
		}

		return { type: "wide", cols: [main] };
	}
}
