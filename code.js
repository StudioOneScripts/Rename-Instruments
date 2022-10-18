function renameInstrumentsAfterTracks()
{
	this.interfaces =  [Host.Interfaces.IEditTask]

	// ----------------------------------------------------------

	this.prepareEdit = function (context)
	{
		return Host.Results.kResultOk;
	}

	// ----------------------------------------------------------

	this.performEdit = function (context)
	{
		// Define the track list
		let trackList = context.mainTrackList;

		// If there are no tracks, exit
		if (trackList.numTracks.count == 0) {return}

		// --------------------------------------------

		// This function loads all instrument names and 
		// object urls into the array
		this.Instruments = new Array;
		this.loadInstruments()

		// if there are no instruments found in the rack, exit.
		if (this.Instruments.length == 0) {return}
		
		// **************************************************************************
		// **************** ITERATE TRACKS AND RENAME INSTRUMENTS *******************
		// **************************************************************************
		
		for (i = 0; i < trackList.numTracks; i++)
		{ 
			// Get the current track
			var track = trackList.getTrack(i);

			// If it's not a music track or if it has no mixer channel, skip it
			if(track.channel.channelType != "MusicTrack" || track.channel == undefined)
				{continue}

			// Otherwise, get the connected instrument name for matching
			var currentInstrumentName = track.channel.findParameter('outputDeviceList').string;

			// Find the current instrument name in the array of all instruments.
			// No two instruments can ever have the same name, so any match will be valid.
			var index = this.Instruments.indexOf(currentInstrumentName)

			// If not found, do nothing.
			if (index < 0) {continue}
		
			// If the name is found in the array, use the URL string from
			// index + 1, the next array item, to target and rename the instrument
			Host.Objects.getObjectByUrl(this.Instruments[index + 1]).findParameter("deviceName").setValue(track.name, true)
		}
		
		return Host.Results.kResultOk;
	}

	// **************************************************************************
	// ******** FUNCTION TO LOAD INSTRUMENT NAMES AND URLS FROM THE RACK ********
	// **************************************************************************

	this.loadInstruments = function ()
	{
		/*  Read all racked instruments data into an array.
			Push:  Instrument name for matching wih indexOf()
			Push:  Instrument object URL for addressing
		*/

		// define instrument rack object
		let instrumentRack = Host.Objects.getObjectByUrl
		("://hostapp/DocumentManager/ActiveDocument/Environment/Synths")
		
		for (i = 1; i < 501; i++)
		{
			var instStr = ""
			
			// format with leading zero if single digit, Inst01, etc
			if (i < 10) {instStr = ("Inst0" + i)} else {instStr = ("Inst" + i)}

			// check if this instrument exists
			var instrument = instrumentRack.find(instStr)

			if (instrument)  // if it's found, push the name and url to the array 
			{
				this.Instruments.push(instrument.findParameter("deviceName").string)
				this.Instruments.push("://hostapp/DocumentManager/ActiveDocument/Environment/Synths/" + instStr )
			}
		}
	}
}

// Entry  -------------------------------------
function createInstance()
{
	return new renameInstrumentsAfterTracks();
}