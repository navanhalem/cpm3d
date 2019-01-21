settings=$settingsfolder/$expname-settings.js
template=$settingsfolder/$expname-template.js #txt

paramfile=params_forced_rand_dir_no_stroma.txt
nsim=10

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
	LDIR=$( cat $paramfile | awk -v line=$p 'NR==line{print $3}')
	STROMA=$( cat $paramfile | awk -v line=$p 'NR==line{print $4}')
	EXPNAME="3d"
		
	NAME=$EXPNAME-lforced$LFORCED-lrand$LRAND-ldir$LDIR-stroma$STROMA

	# Now the recipes for the individual simulation tracks
	for sim in $(seq 1 $nsim) ; do

		# trackfiles
		FILE=data/$NAME-sim$sim.txt
		echo "$FILE : ../cpm3d.js"
		echo -e "\t@"node \$\< $LFORCED $LRAND $LDIR 1 500 2000 $STROMA "> \$@"
		echo "all : "$FILE
	done
done
