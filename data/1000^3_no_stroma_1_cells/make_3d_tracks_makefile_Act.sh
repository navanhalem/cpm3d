settings=$settingsfolder/$expname-settings.js
template=$settingsfolder/$expname-template.js #txt

paramfile=params_Act.txt
nsim=30

# ---------------------------------------------------------------------
# CODE:
# ---------------------------------------------------------------------

np=$( cat $paramfile | wc -l )

echo ".DELETE_ON_ERROR :"
echo "all : "

# Loop over the simulations and parameter combis
for p in $(seq 1 $np) ; do

	LACT=$( cat $paramfile | awk -v line=$p 'NR==line{print $1}')
	MAXACT=$( cat $paramfile | awk -v line=$p 'NR==line{print $2}')
	EXPNAME="3d"
		
	NAME=$EXPNAME-lact$LACT-mact$MAXACT

	# Now the recipes for the individual simulation tracks
	for sim in $(seq 1 $nsim) ; do

		# trackfiles
		FILE=data/$NAME-sim$sim.txt
		echo "$FILE : ../../cpm3d.js"
		echo -e "\t@"node \$\< 0 0 0 1 1000 2000 0 $LACT $MAXACT "> \$@"
		echo "all : "$FILE
	done
done
