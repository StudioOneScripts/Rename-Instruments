function renameInstrumentsAfterTracks()
{
	this.interfaces =  [Host.Interfaces.IEditTask]

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

		// This loads the racked instruments data into an array.
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

			// Otherwise, get the connected instruments' name for matching
			var currentInstrumentName = track.channel.findParameter('outputDeviceList').string;

			// Find the current instrument name in the array of racked instruments.
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
	// ************* LOAD INSTRUMENT NAMES AND URLS FROM THE RACK ***************
	// **************************************************************************

	this.loadInstruments = function ()
	{
		/*  Read all of the racked instrument data into an array.
			Push:  Instrument name for matching wih indexOf()
			Push:  Instrument object URL for addressing
		*/

		this.Instruments = new Array;

		let synthRack = Host.Objects.getObjectByUrl
		("://hostapp/DocumentManager/ActiveDocument/Environment/Synths")

		// ---------------------------------------------------------------------------
		//  Instrument URLs require leading zeros if the number is a single digit
		//  Inst01, Inst02, etc.  We search and test for each possible number
		// ---------------------------------------------------------------------------
		
		for (i = 1; i < 501; i++)
		{
			if (i < 10)
			{
				// look for instrument i when i is a single digit
				var instrument = synthRack.find("Inst0" + i)

				if (instrument)  // if it's found, push the name and url to the array 
				{
					this.Instruments.push(instrument.findParameter("deviceName").string)
					this.Instruments.push("://hostapp/DocumentManager/ActiveDocument/Environment/Synths/Inst0"  + i)
				}
			}
			else
			{
				// look for instrument i when i is double digit or greater
				var instrument = synthRack.find("Inst" + i)

				if (instrument)  // if it's found, push the name and url to the array
				{
					this.Instruments.push(instrument.findParameter("deviceName").string)
					this.Instruments.push("://hostapp/DocumentManager/ActiveDocument/Environment/Synths/Inst"  + i)
				}	
			}
		}
	}
}

// Entry  ------------------------------------------------------
function createInstance()
{
	return new renameInstrumentsAfterTracks();
}
