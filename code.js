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

		// if there are no selected tracks, do nothing
		if (trackList.numTracks.count == 0) {return}

		// ------------------------------------------------------------------------
		
		/*  Read all of the racked instruments into two arrays
			loadedInstrumentNames:  holds the names for quick matching
			instrumentURLs: holds the object URLs for addressing

			The numbers in the instrument URLs are static.  For example,
			if you load 200 instruments and delete the first 199, the
			remaining instrument URL still be /Inst200, so we have check
			all possible iterations up to a reasonable number like 500
		*/

		var loadedInstrumentNames = new Array;
		var instrumentURLs = new Array;

		for (i = 1; i < 501; i++)
		{
			var rackedInst = ""

			// the URLs require leading zeros if less than 10
			if (i < 10)
			{
				rackedInst = Host.Objects.getObjectByUrl
					("://hostapp/DocumentManager/ActiveDocument/Environment/Synths/Inst" + "0" + i)
					
				if (rackedInst == undefined || rackedInst == "" || rackedInst.findParameter('deviceName') == undefined || rackedInst == null) {continue}

				// load the two arrays, the name and the URL
				loadedInstrumentNames.push(rackedInst.findParameter("deviceName").string)
				instrumentURLs.push("://hostapp/DocumentManager/ActiveDocument/Environment/Synths/Inst" + "0" + i)
			}
			else
			{
				rackedInst = Host.Objects.getObjectByUrl
					("://hostapp/DocumentManager/ActiveDocument/Environment/Synths/Inst" + i)

				if (rackedInst == undefined || rackedInst == "" || rackedInst.findParameter('deviceName') == undefined || rackedInst == null) {continue}

				// load the two arrays, the name and the URL
				loadedInstrumentNames.push(rackedInst.findParameter("deviceName").string)
				instrumentURLs.push("://hostapp/DocumentManager/ActiveDocument/Environment/Synths/Inst"  + i)
			}
		}

		// ------------------------------------------------------------------------

		// there are no instruments in the rack, do nothing.
		if (loadedInstrumentNames.length == 0) {return}
		
		// iterate the selected tracks to rename the instruments
		for (i = 0; i < trackList.numTracks; i++)
		{ 
			// get the current selected track
			var track = trackList.getTrack(i);

			// skip if it has no audioo channel or if it's not a music track
			if(track.channel == undefined || track.channel.channelType != "MusicTrack") 
				{continue}

			// otherwise, get it's assigned instrument name
			var currentInstrumentName = track.channel.findParameter('outputDeviceList').string;

			// find the current instrument name in the array of racked instruments
			var index = loadedInstrumentNames.indexOf(currentInstrumentName)

			// if not found, do nothing
			if (index < 0) {continue}
		
			// if the name is found in the array, use the URL string from
			// the second array (same index) to target and rename the instrument
			Host.Objects.getObjectByUrl	(instrumentURLs[index])
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
