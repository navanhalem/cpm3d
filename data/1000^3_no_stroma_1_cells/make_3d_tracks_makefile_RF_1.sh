settings=$settingsfolder/$expname-settings.js
template=$settingsfolder/$expname-template.js #txt

paramfile=params_RF_1.txt
nsim=30

# ---------------------------------------------------------------------
# CODE:
# ---------------------------------------------------------------------

np=$( cat $paramfile | wc -l )

echo ".DELETE_ON_ERROR :"
echo "all : "

# Loop over the simulations and parameter combis
for p in $(seq 1 $np) ; do

	LFORCED=$( cat $paramfile | awk -v line=$p 'NR==line{print $1}')
	LRAND=$( cat $paramfile | awk -v line=$p 'NR==line{print $2}')
	EXPNAME="3d"
		
	NAME=$EXPNAME-lforced$LFORCED-lrand$LRAND

	# Now the recipes for the individual simulation tracks
	for sim in $(seq 1 $nsim) ; do

		# trackfiles
		FILE=data/$NAME-sim$sim.txt
		echo "$FILE : ../../cpm3d.js"
		echo -e "\t@"node \$\< $LFORCED $LRAND 1000 1 1000 10000 0 0 0 "> \$@"
		echo "all : "$FILE
	done
done
