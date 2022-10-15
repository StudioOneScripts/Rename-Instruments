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
		let trackList = context.mainTrackList;

		// if there are no tracks, do nothing
		if (trackList.numTracks.count == 0) {return}
		
		/*  Read all of the racked instruments into an array.
			Push:  Instrument Name for matching
			Push Next Index:  Instrument Object URL for addressing
		*/

		let Instruments = new Array;

		let synthRack = Host.Objects.getObjectByUrl
		("://hostapp/DocumentManager/ActiveDocument/Environment/Synths")
	
		for (i = 1; i < 501; i++)
		{
			// ---------------------------------------------------------------------------
			//  the instrument URLs require leading zeros if the number is a single digit
			//  Inst01, Inst02, etc, so search and test for each possible number
			// ---------------------------------------------------------------------------

			if (i < 10)
			{
				// look for instrument #i when i is a single digit
				var Instrument = synthRack.find("Inst0" + i)

				if (Instrument)  // if it's found push the name and url to the arrays
				{
					Instruments.push(Instrument.findParameter("deviceName").string)
					Instruments.push("://hostapp/DocumentManager/ActiveDocument/Environment/Synths/Inst0"  + i)
				}
			}
			else
			{
				// look for instrument #i when i is double digit or greater
				var Instrument = synthRack.find("Inst" + i)

				if (Instrument)  // if it's found push the name and url to the arrays
				{
					Instruments.push(Instrument.findParameter("deviceName").string)
					Instruments.push("://hostapp/DocumentManager/ActiveDocument/Environment/Synths/Inst"  + i)
				}	
			}
		}
					
		// ------------------------------------------------------------------------

		// if there are no instruments found in the rack, do nothing.
		if (Instruments.length == 0) {return}

		// ------------------------------------------------------------------------
		
		// iterate the tracks and do the thing
		for (i = 0; i < trackList.numTracks; i++)
		{ 
			// get the current selected track
			var track = trackList.getTrack(i);

			// if it's not a music track or it has no mixer channel, skip it
			if(track.channel.channelType != "MusicTrack"  || track.channel == undefined)
				{continue}

			// otherwise, get it's current instrument name for searching
			var currentInstrumentName = track.channel.findParameter('outputDeviceList').string;

			// find the current instrument name in the array of racked instruments
			// no two instruments can have the same name, so any match is valid
			var index = Instruments.indexOf(currentInstrumentName)

			// if not found, do nothing
			if (index < 0) {continue}
		
			// if the name is found in the array, use the URL string from
			// the next array index to target and rename the instrument
			Host.Objects.getObjectByUrl	(Instruments [index + 1] )
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
