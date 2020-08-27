# SIR_Disease_Simulation

SIR stands for Susceptible, Infected , Recovered. Where a recovered person can not be re-infected.
The project is made as assignment project graded by Prof. MVP , CSE ,IIT,Hyderabad.
The Project uses Graph , binary heap's array based implementation for event management.
It used predifined probability of a certain person getting infected. In the project we create a graph having certain amount of predefined 
nodes where each node represents a person. 
The edge represents connection between two persons.
We further classify a person represented by node in one of three Susceptible, it means a person
is not yet infected and if he comes in contact with a infected then he might get infected where the probability of getting infected by getting in touch
is predefined. 
It is assumed that a person can not get infected in any way other than getting in contact with a infected person.
The second category is Infected. An infected person takes several days to recover ,if the days required is more than the days of simulation 
we do not process that node's recovery. The number of days a node needs to get well, we run probability analysis with a predefined probability.
The third category is recovered. If a certain node is recovered we simply discard it from any process.

After initialisation of the graph we randomly choose certain amount of nodes and make them infected and then run the simualtion.
The output.txt file prints the node id of suspected, infected and recovered at the end of each day.
