/* This script automatically renames all instruments that
   are assigned to instrument tracks, after the tracks  */

function renameInstrumentsAfterTracks()
{
	this.interfaces =  [Host.Interfaces.IEditTask]

	this.prepareEdit = function (context)
	{
		return Host.Results.kResultOk;
	}

	// -----------------------------------------------------------------

	this.performEdit = function (context)
	{
		// define the track list
		var trackList = context.mainTrackList;

		// if there are no tracks, do nothing
		if (trackList.numTracks.count == 0) {return}
		
		/*  Read all of the racked instruments into two arrays.
			loadedInstrumentNames:  holds the names for quick matching
			instrumentURLs: holds the object URLs for addressing

			Note: The numbers in the instrument URLs are static.  For example,
			if you load 200 instruments and delete the first 199, the
			remaining instrument URL will still be /Inst200, so we have to
			check all possible iterations up to a reasonable number 
		*/

		var InstrumentNames = new Array;
		var InstrumentURLs = new Array;

		synthRack = Host.Objects.getObjectByUrl
		("://hostapp/DocumentManager/ActiveDocument/Environment/Synths")
	
		for (i = 1; i < 501; i++)
		{
			// ---------------------------------------------------------------------------
			//  the instrument URLs require leading zeros if the number is a single digit
			//  Inst01, Inst02, etc, so search . test for each possible number
			// ---------------------------------------------------------------------------

			if (i < 10)
			{
				// look for instrument #i when i is a single digit, use leading zero
				var Instrument = synthRack.find("Inst0" + i)

				if (Instrument)  // if it's found push the name and url to the arrays
				{
					InstrumentNames.push(Instrument.findParameter("deviceName").string)
					InstrumentURLs.push("://hostapp/DocumentManager/ActiveDocument/Environment/Synths/Inst0"  + i)
				}
			}
			else
			{
				// look for instrument #i when i is double digit or greater
				var Instrument = synthRack.find("Inst" + i)

				if (Instrument)  // if it's found push the name and url to the arrays
				{
					InstrumentNames.push(Instrument.findParameter("deviceName").string)
					InstrumentURLs.push("://hostapp/DocumentManager/ActiveDocument/Environment/Synths/Inst"  + i)
				}	
			}
		}
					
		// ------------------------------------------------------------------------

		// if there are no instruments found in the rack, do nothing.
		if (InstrumentNames.length == 0) {return}

		// ------------------------------------------------------------------------
		
		// iterate the tracks 
		for (i = 0; i < trackList.numTracks; i++)
		{ 
			// get the current selected track
			var track = trackList.getTrack(i);

			// if it's not music track or it has not mixer channel, skip
			if(track.channel.channelType != "MusicTrack"  || track.channel == undefined)
				{continue}

			// otherwise, get it's current instrument name for searching
			var currentInstrumentName = track.channel.findParameter('outputDeviceList').string;

			// find the current instrument name from above in the array of racked instruments
			var index = InstrumentNames.indexOf(currentInstrumentName)

			// if not found, do nothing
			if (index < 0) {continue}
		
			// if the name is found in the array, use the URL string from
			// the second array (same index) to target and rename the instrument
			Host.Objects.getObjectByUrl	(InstrumentURLs[index])
			.findParameter("deviceName").setValue(track.name, true)
		}
		
		return Host.Results.kResultOk;
	}
}

// ---------------------------------------------------------------------

// entry function
function createInstance()
{
	return new renameInstrumentsAfterTracks();
}

// ---------------------------------------------------------------------

// messaging shortcuts
function print  (msg) { Host.Console.writeLine(msg.toString()) }
function alert  (msg) { Host.GUI.alert(msg.toString()) }

// parse object properties
function getAllPropertyNames(obj)
{
	var props = [];
	do
	{
		props = props.concat(Object.getOwnPropertyNames(obj));
	} while (obj = Object.getPrototypeOf(obj));
	for (i in props)
		print(props[i])
}
